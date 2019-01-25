const crypto = require('crypto');
const {db} = require('../database');
const {getImageExtension} = require('../utils');
const multer = require('multer');
const path = require('path');
const {promisify} = require('util');
const scrypt = require('scrypt-js');
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
	const {username, background, profile} = await db().collection('users').findOne({});

	res.json({
		ok: true,
		user: {
			username, background, profile
		}
	});
});

router.post('/', async (req, res) => {
	const count = await db().collection('users').count();

	if(count !== 0) {
		res.status(403).json({
			ok: false,
			reason: 'already-user-exists'
		});
		return;
	}

	const {username, password} = req.body;
	if(typeof username !== 'string' || typeof password !== 'string') {
		res.status(400).json({
			ok: false,
			reason: 'wrong-arguments'
		});
		return;
	}

	if(username.length > 32) {
		res.status(400).json({
			ok: false,
			reason: 'wrong-arguments'
		});
		return;
	}

	const salt = crypto.randomBytes(32);
	const passwordNormalized = password.normalize('NFKC');

	const passwordHashed = await new Promise((resolve, reject) => {
		scrypt(passwordNormalized, salt, 1638, 8, 1, 32, (err, progress, key) => {
			if(err) return reject(err);
			if(key) return resolve(key);
		});
	});

	const passwordFinal = `${salt}$${passwordHashed}`;

	await db().collection('users').insertOne({
		username,
		password: passwordFinal,
		profile: '/defaults/profile.jpg',
		background: '/defaults/background.jpg'
	});

	res.json({
		ok: true
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

router.patch('/', async (req, res) => {
	const {username, password} = req.body;
	if(typeof username === 'string') {
		if(username.length > 32) {
			res.status(400).json({
				ok: false,
				reason: 'wrong-arguments'
			});
			return;
		}

		await db().collection('users').findOneAndUpdate({}, {
			$set: {
				username
			}
		});
	}

	if(typeof password === 'string') {
		const salt = crypto.randomBytes(32);
		const passwordNormalized = password.normalize('NFKC');

		const passwordHashed = await new Promise((resolve, reject) => {
			scrypt(passwordNormalized, salt, 1638, 8, 1, 32, (err, progress, key) => {
				if(err) return reject(err);
				if(key) return resolve(key);
			});
		});

		const passwordFinal = `${salt}$${passwordHashed}`;

		await db().collection('users').findOneAndUpdate({}, {
			$set: {
				password: passwordFinal
			}
		});
	}
});

router.patch('/profile', upload.single('profile'), async (req, res) => {
	if(!req.file) {
		res.status(400).json({
			ok: false,
			reason: 'file-not-uploaded'
		});
		return;
	}

	const extension = getImageExtension(req.file.mimetype);

	await promisify(fs.rename)(req.file.path, path.resolve(
		__dirname, '..', '..', `./static/static_user/`, `profile.${extension}`
	));

	await db().collection('users').findOneAndUpdate({}, {
		$set: {
			profile: `/static_user/profile.${extension}`
		}
	});
});

router.patch('/background', upload.single('background'), async (req, res) => {
	if(!req.file) {
		res.status(400).json({
			ok: false,
			reason: 'file-not-uploaded'
		});
		return;
	}

	const extension = getImageExtension(req.file.mimetype);

	await promisify(fs.rename)(req.file.path, path.resolve(
		__dirname, '..', '..', `./static/static_user/`, `background.${extension}`
	));

	await db().collection('users').findOneAndUpdate({}, {
		$set: {
			profile: `/static_user/background.${extension}`
		}
	});
});

module.exports = router;
