const bodyParser = require('body-parser');
const config = require('./config');
const cookieParser = require('cookie-parser');
const {database} = require('./database');
const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');

//Routes
const auth = require('./routes/auth');
const post = require('./routes/post');
const site = require('./routes/site');
const user = require('./routes/user');

config.init();
database.init();

const app = express();
app.use(async (req, res, next) => {
	if(database.initialized) {
		next();
		return;
	}

	database.once('init', next);
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(async (req, res, next) => {
	const authToken = req.get('Nanobridge-Authorization');
	const db = database.db;

	let token = {};
	let authedTo = [];
	let acl = config.store.acl.guest;

	try {
		token = await promisify(jwt.verify)(authToken, config.store.secret);

		const user = await db.collection('users').findOne({
			loginName: token.loginName
		});

		if(token.lastUpdate !== user.lastUpdate) {
			throw new Error("Token Invalidated");
		}

		const subusers = await db.collection('users').find({
			subUserOf: token.loginName
		}).toArray();

		authedTo = subusers.map(v => v.loginName).concat(token.loginName);
		acl = user.acl;
	} catch(err) {
		req.authState = false;
		req.acl = config.store.acl.guest.slice();
		next();
		return;
	}

	req.username = token.username;
	req.loginName = token.loginName;
	req.authedTo = name => {
		if(acl.includes('authAnyone')) return true;

		return authedTo.includes(name);
	};
	req.authState = true;
	req.authToken = authToken;
	req.acl = acl;

	next();
});

app.use((req, res, next) => {
	req.deleteUploaded = async () => {
		if(req.file) {
			try {
				await promisify(fs.unlink)(req.file.path);
			} catch(e) {}
		}

		if(req.files) {
			if(Array.isArray(req.files)) {
				for(let file of req.files) {
					try {
						await promisify(fs.unlink)(file.path);
					} catch(e) {}
				}

				return;
			}

			for(let fieldKey of Object.keys(req.files)) {
				for(let file of req.files[fieldKey]) {
					try {
						await promisify(fs.unlink)(file.path);
					} catch(e) {}
				}
			}
		}
	};

	next();
});

app.get('/', (req, res) => {
	res.status(418).json({
		'nanobridge': 'A microblog application',
		'server': 'NanoBridge API Server',
		'ok': true
	});
});

app.use('/auth', auth);
app.use('/post', post);
app.use('/site', site);
app.use('/user', user);

app.use((err, req, res, next) => {
	res.status(500);
	res.json({
		ok: false,
		reason: 'internal-server'
	});

	console.error(err);
});

module.exports = {
	path: '/api',
	handler: app
};
