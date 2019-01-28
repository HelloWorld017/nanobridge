const crypto = require('crypto');
const {db} = require('../database');
const fs = require('fs');
const {exists, hexToDec, getImageExtension, markdown, sanitizePostObject} = require('../utils');
const multer = require('multer');
const path = require('path');
const {promisify} = require('util');
const {Router} = require('express');

const router = new Router();
const upload = multer({
	dest: path.resolve(__dirname, '..', '..', './static/uploads/'),
	limits: {
		fields: 512,
		fileSize: 10 * 1024 * 1024,
		files: 32,
		parts: 128
	}
});

router.get('/', async (req, res) => {
	let page = 1;

	if(typeof req.query.page === 'number' && isFinite(req.query.page) && req.query.page > 0) {
		page = req.query.page;
	}

	const posts = await db().collection('posts').find({
		$or: [
			{replyTo: {$exists: false}},
			{replyTo: null}
		]
	}).limit(25).skip((page - 1) * 25).toArray();

	res.json({
		ok: true,
		posts: posts.map(sanitizePostObject)
	});
});

router.get('/:postId(\\d+)', async (req, res) => {
	const {postId} = req.params;
	if(typeof postId !== 'string') {
		res.status(400).json({
			ok: false,
			reason: 'wrong-arguments'
		});
		return;
	}

	const post = await db().collection('posts').findOne({
		postId: postId
	});

	if(!post) {
		res.status(404).json({
			ok: false,
			reason: 'post-does-not-exist'
		});
		return;
	}

	res.json({
		ok: true,
		post: sanitizePostObject(post)
	});
});

router.get('/:postId(\\d+)/replies', async (req, res) => {
	const {postId} = req.params;
	if(typeof postId !== 'string') {
		res.status(400).json({
			ok: false,
			reason: 'wrong-arguments'
		});
		return;
	}

	let page = 1;

	if(typeof req.query.page === 'number' && isFinite(req.query.page) && req.query.page > 0) {
		page = req.query.page;
	}

	const posts = await db().collection('posts').find({
		replyTo: postId
	}).toArray();

	res.json({
		ok: true,
		post: posts.map(sanitizePostObject)
	});
});

router.use((req, res, next) => {
	if(!req.authState) {
		res.status(403).json({
			ok: false,
			reason: 'not-authenticated'
		});
		return;
	}

	next();
});

router.post('/', upload.array('images', 32), async (req, res) => {
	let {author, content, replyTo} = req.body;
	if(typeof content !== 'string') {
		res.status(400).json({
			ok: false,
			reason: 'wrong-arguments'
		});
		await req.deleteUploaded();
		return;
	}

	if(typeof author !== 'string' || !req.authedTo.includes(author)) {
		author = req.loginName;
	}

	const markedContent = markdown(content);
	const images = [];

	const postIdGen = (Date.now() * 100).toString(16) + Math.floor(Math.random() * 100).toString(16);
	const postId = hexToDec(crypto.createHash('md5').update(postIdGen).digest('hex'));
	const postBasedir = path.resolve(__dirname, '..', '..', 'static', 'static_post', postId);

	if(req.files.length !== 0) {
		await promisify(fs.mkdir)(postBasedir);
	}

	for(let [fileIndex, file] of req.files.entries()) {
		const ext = getImageExtension(file.mimetype);
		const imageFile = `${fileIndex + 1}.${ext}`;
		await promisify(fs.rename)(file.path, path.resolve(postBasedir, imageFile));

		images.push({
			id: fileIndex + 1,
			file: imageFile
		});
	}

	const post = {
		author,
		postId,
		content: markedContent,
		images,
		lastImageId: images.length,
		createdAt: Date.now()
	};

	if(typeof replyTo === 'string') {
		const replyingPost = await db().collection('posts').findOne({
			postId: replyTo
		});

		if(replyingPost && !replyingPost.replyTo && replyingPost.author === author) {
			post.replyTo = replyTo;
		} else {
			post.replyTo = null;
		}
	}

	await db().collection('posts').insertOne(post);

	res.json({
		ok: true,
		post: sanitizePostObject(post)
	});
});

router.patch('/:postId/', upload.array('addImages', 32), async (req, res) => {
	const {postId} = req.params;
	const {content, deleteImages} = req.body;
	const setObject = {};

	const originalPost = await db().collection('posts').findOne({postId});
	if(!originalPost) {
		res.status(400).json({
			ok: false,
			reason: 'wrong-arguments'
		});
		await req.deleteUploaded();
		return;
	}

	if(!req.authedTo.includes(originalPost.author)) {
		res.status(403).json({
			ok: false,
			reason: 'no-permission'
		});
		await req.deleteUploaded();
		return;
	}

	const postBasedir = path.resolve(__dirname, '..', '..', 'static', 'static_post', postId);
	const postBasedirExists = await exists(postBasedir);

	if(typeof content === 'string') {
		const markedContent = markdown(content);
		setObject.content = markedContent;
	}

	let newImages = originalPost.images;

	if(typeof deleteImages === 'string') {
		const deleteArray = deleteImages.split(',');
		const deleteIds = deleteArray.map(v => parseInt(v)).filter(v => isFinite(v));
		const deletingFiles = [];

		newImages = newImages.filter(({id, file}) => {
			if(deleteIds.includes(id)) {
				deletingFiles.push(file);
				return false;
			}

			return true;
		});

		for(let file of deletingFiles) {
			await promisify(fs.unlink)(path.resolve(postBasedir, file));
		}
	}

	if(req.files.length > 0 && !postBasedirExists) {
		await promisify(fs.mkdir)(postBasedir);
	}

	for(let [fileIndex, file] of req.files.entries()) {
		const ext = getImageExtension(file.mimetype);
		const imageFile = `${fileIndex + 1}.${ext}`;
		await promisify(fs.rename)(file.path, path.resolve(postBasedir, imageFile));

		newImages.push({
			id: fileIndex + 1 + originalPost.lastImageId,
			file: imageFile
		});
	}

	setObject.lastImageId = originalPost.lastImageId + req.files.length;
	setObject.images = newImages;

	await db().collection('posts').findOneAndUpdate({postId}, {
		$set: setObject
	});
});

router.delete('/:postId/', async (req, res) => {
	const {postId} = req.body;

	if(typeof postId !== 'string') {
		res.status(400).json({
			ok: false,
			reason: 'wrong-arguments'
		});
		return;
	}

	const originalPost = await db().collection('posts').findOne({postId});
	if(!originalPost) {
		res.status(400).json({
			ok: false,
			reason: 'wrong-arguments'
		});
		return;
	}

	if(!req.authedTo.includes(originalPost.author)) {
		res.status(403).json({
			ok: false,
			reason: 'no-permission'
		});
		return;
	}

	const postBasedir = path.resolve(__dirname, '..', '..', 'static', 'static_post', postId);

	if(await exists(postBasedir)) {
		for(let {file} of originalPost.images) {
			await promisify(fs.unlink)(path.resolve(postBasedir, file));
		}

		await promisify(fs.rmdir)(postBasedir);
	}

	await db().collection('posts').update(
		{replyTo: postId},
		{$set: {replyTo: null}}
	);
	await db().collection('posts').remove({postId}, {justOne: true});
});

module.exports = router;
