const config = require('../config');
const {db} = require('../database');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const {requireACL} = require('../utils');
const scrypt = require('scrypt-js');
const {Router} = require('express');

const router = new Router();

router.get('/', (req, res) => {
	if(req.authState) {
		res.json({
			ok: true,
			authenticated: true,
			username: req.username,
			loginName: req.loginName,
			acl: req.acl
		});
		return;
	}

	res.json({
		ok: true,
		authenticated: false,
		acl: req.acl
	});
});

router.post('/', async (req, res) => {
	const {loginName, password} = req.body;
	if(typeof loginName !== 'string' || typeof password !== 'string') {
		res.status(400).json({
			ok: false,
			reason: 'wrong-arguments'
		});
		return;
	}

	if(req.authState) {
		res.json({
			ok: true,
			token: req.authToken,
			username: req.username,
			acl: req.acl
		});
		return;
	}

	const query = loginName.includes('@') ? {email: loginName} : {loginName};
	const user = await db().collection('users').findOne(query);
	const phaseUser = await db().collection('registrationPhase').findOne(query);
	const authingUser = user || phaseUser;

	if(!authingUser || user.subUserOf) {
		res.status(403).json({
			ok: false,
			reason: 'wrong-id-or-password'
		});
		return;
	}

	if(user && !user.acl.includes('authGenerate')) {
		res.status(403).json({
			ok: false,
			reason: 'no-permission'
		});
		return;
	}

	const passwordNormalized = Buffer.from(password.normalize('NFKC'), 'utf8');
	const [salt, targetPassword] = authingUser.password.split('$');
	const passwordHashed = await new Promise((resolve, reject) => {
		scrypt(passwordNormalized, Buffer.from(salt, 'hex'), 1024, 8, 1, 32, (err, progress, key) => {
			if(err) return reject(err);
			if(key) return resolve(Buffer.from(key));
		});
	});

	const correct = passwordHashed.toString('hex') === targetPassword;

	if(!correct) {
		res.json({
			ok: false,
			reason: 'wrong-id-or-password'
		});
		return;
	}

	if(phaseUser) {
		res.json({
			ok: false,
			reason: 'please-auth-email'
		});
		return;
	}

	const token = await promisify(jwt.sign)({
		username: user.username,
		loginName: user.loginName,
		lastUpdate: user.lastUpdate
	}, config.store.$secret, {
		algorithm: 'HS256'
	});

	res.json({
		ok: true,
		token,
		username: user.username,
		acl: user.acl
	});
});

router.get('/email/:emailAuthToken', async (req, res) => {
	const {emailAuthToken} = req.params;
	const user = await db().collection('registrationPhase').findOne({emailAuthToken});

	if(!user) {
		res.json({
			ok: false,
			reason: 'wrong-token'
		});
		return;
	}

	await db().collection('registrationPhase').remove({emailAuthToken});
	await db().collection('users').insertOne(user);

	res.json({
		ok: true
	});
});

router.get('/template', (req, res) => {
	res.type('html').send(
		new EmailAuthTemplate({
			token: '6f8adb01728ff',
			username: 'Khinenw'
		}).render()
	);
});

module.exports = router;
