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
	try {
		const user = await db.collection('users').findOne({});
		token = await promisify(jwt.verify)(authToken, config.store.secret);

		if(token.lastUpdate !== user.lastUpdate) {
			throw new Error("Token Invalidated");
		}
	} catch(err) {
		req.authState = false;
		next();
		return;
	}

	req.username = token.username;
	req.authState = true;
	req.authToken = authToken;

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

app.use('/auth', auth);
app.use('/post', post);
app.use('/user', user);

module.exports = {
	path: '/api',
	handler: app
};
