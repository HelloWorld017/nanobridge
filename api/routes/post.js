const config = require('../config');
const crypto = require('crypto');
const {db} = require('../database');
const fs = require('fs');
const {exists, hexToDec, getImageExtension, mapPostObject,
	markdown, requireACL, sanitizePostObject, sanitizeUserObject} = require('../utils');
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

router.use((req, res, next) => {
	req.nanoPosts = {
		getPage() {
			let page = 1;

			if(req.query.page) {
				const parsedPage = parseInt(req.query.page);
				if(isFinite(parsedPage) && parsedPage > 0) {
					page = parsedPage;
				}
			}

			return page;
		},

		async getDocuments(query, countNeeded = true) {
			const isAlbum = req.query.album === '1';
			const albumQuery = {
				$and: [
					query,
					{images: {$not: {$size: 0}}}
				]
			};
			const targetQuery = isAlbum ? albumQuery : query;
			const targetPerPage = config.store.listing[isAlbum ? 'albumsPerPage' : 'postsPerPage'];

			const page = this.getPage();
			const posts = await db().collection('posts')
				.find(targetQuery)
				.limit(targetPerPage)
				.sort({createdAt: -1})
				.skip((page - 1) * targetPerPage)
				.toArray();

			const counts = {};
			if(countNeeded) {
				counts.post = await db().collection('posts').countDocuments(query);
				counts.album = await db().collection('posts').countDocuments(albumQuery);
				counts.target = isAlbum ? counts.album : counts.post;
				counts.enabled = true;
			}

			if(counts.target === undefined) {
				counts.target = await db().collection('posts').countDocuments(targetQuery);
				counts.enabled = false;
			}

			const maxPages = Math.ceil(counts.target / targetPerPage);
			return Object.assign({
				ok: true,
				pagination: {
					current: page,
					max: Math.max(1, maxPages),
					perPage: targetPerPage
				},
				counts
			}, await mapPostObject(posts));
		}
	};

	next();
});

router.get('/', requireACL('postRead'), async (req, res) => {
	res.json(await req.nanoPosts.getDocuments({
		$or: [
			{replyTo: {$exists: false}},
			{replyTo: null}
		]
	}, false));
});

router.get('/:postId(\\d+)', requireACL('postRead'), async (req, res) => {
	const {postId} = req.params;
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
		post: sanitizePostObject(post),
		user: sanitizeUserObject(await db().collection('users').findOne({loginName: post.author}))
	});
});

router.get('/:postId(\\d+)/replies', requireACL('postRead'), async (req, res) => {
	const {postId} = req.params;

	res.json(await req.nanoPosts.getDocuments({
		replyTo: postId
	}));
});

router.get('/written-by/:loginName', requireACL('postRead'), async (req, res) => {
	const {loginName} = req.params;

	res.json(await req.nanoPosts.getDocuments({
		author: loginName
	}));
});

router.get('/written-by/:loginName/:postId/page', requireACL('postRead'), async (req, res) => {
	const {loginName, postId} = req.params;
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

	const documentCounts = await db().collection('posts').countDocuments({
		createdAt: {
			$gte: post.createdAt
		}
	});

	res.json({
		ok: true,
		page: Math.floor(documentCounts / config.store.listing.postsPerPage) + 1
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

router.post('/', requireACL('postWrite'), upload.array('images', 32), async (req, res) => {
	let {author, content, replyTo} = req.body;
	if(typeof content !== 'string') {
		res.status(400).json({
			ok: false,
			reason: 'wrong-arguments'
		});
		await req.deleteUploaded();
		return;
	}

	if(typeof author !== 'string' || !req.authedTo(author)) {
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

			await db().collection('posts').findOneAndUpdate(
				{postId: replyTo},
				{$inc: {replyCount: 1}}
			);
		} else {
			post.replyTo = null;
		}
	}

	if(post.replyTo === undefined) {
		post.replyCount = 0;
	}

	await db().collection('posts').insertOne(post);

	res.json({
		ok: true,
		post: sanitizePostObject(post)
	});
});

router.patch('/:postId(\\d+)/', requireACL('postUpdate'), upload.array('addImages', 32), async (req, res) => {
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

	if(!req.authedTo(originalPost.author)) {
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

	res.json({
		ok: true
	});
});

router.delete('/:postId(\\d+)/', requireACL('postDelete'), async (req, res) => {
	const {postId} = req.params;

	const originalPost = await db().collection('posts').findOne({postId});
	if(!originalPost) {
		res.status(400).json({
			ok: false,
			reason: 'wrong-arguments'
		});
		return;
	}

	if(!req.authedTo(originalPost.author)) {
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

	if(originalPost.replyTo) {
		await db().collection('posts').findOneAndUpdate(
			{postId: originalPost.replyTo},
			{$inc: {replyCount: -1}}
		);
	}

	await db().collection('posts').updateMany(
		{replyTo: postId},
		{$set: {replyTo: null}}
	);
	await db().collection('posts').deleteOne({postId});

	res.json({
		ok: true
	});
});

module.exports = router;
