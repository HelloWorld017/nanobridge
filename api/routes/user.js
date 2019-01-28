const config = require('../config');
const crypto = require('crypto');
const {db} = require('../database');
const fs = require('fs');
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

router.get('/:userLoginName', async (req, res) => {
	const {userLoginName} = req.params;
	const user = await db().collection('users').findOne({
		loginName: userLoginName
	});

	if(!user) {
		res.json({
			ok: false,
			reason: 'no-user'
		});
		return;
	}

	const {username, background, profile, loginName} = user;

	res.json({
		ok: true,
		user: {
			username, background, profile, loginName
		}
	});
});

router.post('/', async (req, res) => {
	const {loginName, username, password, key} = req.body;

	if(key !== config.store.userCreateToken) {
		res.status(403).json({
			ok: false,
			reason: 'wrong-createtoken'
		});
		return;
	}

	if(typeof loginName !== 'string' || typeof username !== 'string' || typeof password !== 'string') {
		res.status(400).json({
			ok: false,
			reason: 'wrong-arguments'
		});
		return;
	}

	if(!/[a-zA-Z0-9-_.]{5,32}/.test(loginName) || username.length > 32) {
		res.status(400).json({
			ok: false,
			reason: 'wrong-arguments'
		});
		return;
	}

	const existing = await db().collection('users').findOne({loginName});
	if(existing) {
		res.status(403).json({
			ok: false,
			reason: 'user-already-exists'
		});
		return;
	}

	const salt = crypto.randomBytes(32);
	const passwordNormalized = Buffer.from(password.normalize('NFKC'), 'utf8');

	const passwordHashed = await new Promise((resolve, reject) => {
		scrypt(passwordNormalized, salt, 1024, 8, 1, 32, (err, progress, key) => {
			if(err) return reject(err);
			if(key) return resolve(Buffer.from(key));
		});
	});

	const passwordFinal = `${salt.toString('hex')}$${passwordHashed.toString('hex')}`;

	await db().collection('users').insertOne({
		loginName,
		username,
		password: passwordFinal,
		profile: '/defaults/profile.jpg',
		background: '/defaults/background.jpg',
		lastUpdate: Date.now()
	});

	res.json({
		ok: true
	});
});

router.param('loginName', async (req, res, next) => {
	const {loginName} = req.params;
	const existing = await db().collection('users').findOne({loginName});

	if(!existing) {
		res.status(403).json({
			ok: false,
			reason: 'not-existing'
		});
		return;
	}

	if(!req.authState || !req.authedTo.includes(loginName)) {
		res.status(403).json({
			ok: false,
			reason: 'not-authenticated'
		});
		return;
	}

	if(existing.subUserOf) {
		req.isSubUser = true;
		req.subUserOwner = existing.subUserOf;
	}

	req.authedUser = existing;

	next();
});

router.get('/:loginName/subuser', async (req, res) => {
	const subusers = await db().collection('users').find({
		subUserOf: req.loginName
	}).toArray();

	res.json({
		ok: true,
		users: subusers.map(v => v.loginName)
	});
});

router.post('/:loginName/subuser', async (req, res) => {
	const loginName = req.loginName;
	let {username, loginName: desiredLoginName} = req.body;

	if(typeof username !== 'string' || username.length > 32) {
		res.status(400).json({
			ok: false,
			reason: 'wrong-arguments'
		});
		return;
	}

	if(typeof desiredLoginName !== 'string' || !/[a-zA-Z0-9-_.]{5,32}/.test(desiredLoginName)) {
		res.status(400).json({
			ok: false,
			reason: 'wrong-arguments'
		});
		return;
	}

	const createdSubUsers = await db().collection('users').countDocuments({
		subUserOf: loginName
	});

	if(config.store.maxSubUsers !== -1 && createdSubUsers > config.store.maxSubUsers) {
		res.status(403).json({
			ok: false,
			reason: 'too-many-subusers'
		});
		return;
	}

	const existing = await db().collection('users').findOne({
		loginName: desiredLoginName
	});

	if(existing) {
		res.status(403).json({
			ok: false,
			reason: 'user-already-exists'
		});
		return;
	}

	await db().collection('users').insertOne({
		loginName: desiredLoginName,
		username,
		profile: '/defaults/profile.jpg',
		background: '/defaults/background.jpg',
		subUserOf: loginName
	});

	res.json({
		ok: true
	});
});

router.patch('/:loginName', async (req, res) => {
	const loginName = req.authedUser.loginName;
	const {username, password, origPassword} = req.body;

	if(typeof username === 'string') {
		if(username.length > 32) {
			res.status(400).json({
				ok: false,
				reason: 'wrong-arguments'
			});
			return;
		}

		await db().collection('users').findOneAndUpdate({
			loginName
		}, {
			$set: {
				username
			}
		});
	}

	if(typeof password === 'string') {
		if(typeof origPassword !== 'string') {
			res.status(400).json({
				ok: false,
				reason: 'wrong-arguments'
			});
			return;
		}

		const user = req.authedUser;

		const origPasswordNormalized = Buffer.from(origPassword.normalize('NFKC'), 'utf8');
		const [origSalt, targetPassword] = user.password.split('$');
		const origPasswordHashed = await new Promise((resolve, reject) => {
			scrypt(origPasswordNormalized, Buffer.from(origSalt, 'hex'), 1024, 8, 1, 32, (err, progress, key) => {
				if(err) return reject(err);
				if(key) return resolve(Buffer.from(key));
			});
		});

		if(origPasswordHashed.toString('hex') !== targetPassword) {
			res.status(403).json({
				ok: false,
				reason: 'orig-password-not-correct'
			});
			return;
		}

		const salt = crypto.randomBytes(32);
		const passwordNormalized = Buffer.from(password.normalize('NFKC'), 'utf8');

		const passwordHashed = await new Promise((resolve, reject) => {
			scrypt(passwordNormalized, salt, 1024, 8, 1, 32, (err, progress, key) => {
				if(err) return reject(err);
				if(key) return resolve(Buffer.from(key));
			});
		});

		const passwordFinal = `${salt.toString('hex')}$${passwordHashed.toString('hex')}`;

		await db().collection('users').findOneAndUpdate({
			loginName
		}, {
			$set: {
				password: passwordFinal,
				lastUpdate: Date.now()
			}
		});
	}

	res.json({
		ok: true
	});
});

router.patch('/:loginName/profile', upload.single('profile'), async (req, res) => {
	if(!req.file) {
		res.status(400).json({
			ok: false,
			reason: 'file-not-uploaded'
		});
		await req.deleteUploaded();
		return;
	}

	const originalProfile = req.authedUser.profile;
	if(originalProfile !== '/defaults/profile.jpg') {
		await promisify(fs.unlink)(originalProfile);
	}

	const extension = getImageExtension(req.file.mimetype);
	const filename = `${req.authedUser.loginName} profile.${extension}`;

	await promisify(fs.rename)(req.file.path, path.resolve(
		__dirname, '..', '..', `./static/static_user/`, filename
	));

	await db().collection('users').findOneAndUpdate({
		loginName: req.authedUser.loginName
	}, {
		$set: {
			profile: `/static_user/${filename}`
		}
	});

	res.json({
		ok: true
	});
});

router.patch('/:loginName/background', upload.single('background'), async (req, res) => {
	if(!req.file) {
		res.status(400).json({
			ok: false,
			reason: 'file-not-uploaded'
		});
		await req.deleteUploaded();
		return;
	}

	const originalBackground = req.authedUser.background;
	if(originalBackground !== '/defaults/background.jpg') {
		await promisify(fs.unlink)(originalBackground);
	}

	const extension = getImageExtension(req.file.mimetype);
	const filename = `${req.authedUser.loginName} background.${extension}`;

	await promisify(fs.rename)(req.file.path, path.resolve(
		__dirname, '..', '..', `./static/static_user/`, filename
	));

	await db().collection('users').findOneAndUpdate({
		loginName: req.authedUser.loginName
	}, {
		$set: {
			profile: `/static_user/${filename}`
		}
	});

	res.json({
		ok: true
	});
});

module.exports = router;
