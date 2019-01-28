const config = require('../config');
const {db} = require('../database');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const scrypt = require('scrypt-js');
const {Router} = require('express');

const router = new Router();

router.get('/', (req, res) => {
	if(req.authState) {
		res.json({
			ok: true,
			authenticated: true,
			username: req.username,
			loginName: req.loginName
		});
		return;
	}

	res.json({
		ok: true,
		authenticated: false
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
			token: req.authToken
		});
		return;
	}

	const user = await db().collection('users').findOne({
		loginName
	});

	if(!user || user.subUserOf) {
		res.json({
			ok: false,
			reason: 'wrong-id-or-password'
		});
		return;
	}

	const passwordNormalized = Buffer.from(password.normalize('NFKC'), 'utf8');
	const [salt, targetPassword] = user.password.split('$');
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

	const token = await promisify(jwt.sign)({
		username: user.username,
		loginName,
		lastUpdate: user.lastUpdate
	}, config.store.secret, {
		algorithm: 'HS256'
	});

	res.json({
		ok: true,
		token
	});
});

module.exports = router;
