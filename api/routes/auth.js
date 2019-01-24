const {db} = require('../database');
const scrypt = require('scrypt-js');
const {Router} = require('express');

const router = new Router();

router.get('/', (req, res) => {
	if(req.authState) {
		res.json({
			ok: true,
			authenticated: true,
			username: req.username
		});
		return;
	}

	res.json({
		ok: true,
		authenticated: false
	});
});

router.post('/', async (req, res) => {
	const {password} = req.body;
	if(typeof password !== 'string') {
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

	const user = await db().collection('users').findOne({});

	if(!user) {
		res.json({
			ok: false,
			reason: 'wrong-id-or-password'
		});
		return;
	}

	const passwordNormalized = password.normalize('NFKC');
	const [salt, targetPassword] = user.password.split('$');
	const passwordHashed = await new Promise((resolve, reject) => {
		scrypt(passwordNormalized, salt, 1638, 8, 1, 32, (err, progress, key) => {
			if(err) return reject(err);
			if(key) return resolve(key);
		});
	});

	const correct = passwordHashed === targetPassword;

	if(!correct) {
		res.json({
			ok: false,
			reason: 'wrong-id-or-password'
		});
		return;
	}

	const token = await promisify(jwt.sign)({username: user.username}, config.secret, {
		algorithm: 'HS256'
	});

	ctx.username = user.username;
	ctx.authState = true;

	res.json({
		ok: true,
		token
	});
});

module.exports = router;
