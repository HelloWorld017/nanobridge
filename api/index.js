const bodyParser = require('body-parser');
const config = require('./config');
const context = require('./context');
const cookieParser = require('cookie-parser');
const {database} = require('./database');
const express = require('express');

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
app.use(cookieParser());
app.use(async (req, res, next) => {
	const authToken = req.body.authentication;

	let token = {};
	try {
		token = await promisify(jwt.verify)(authToken, config.secret);
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

app.use('/auth', auth);
app.use('/post', post);
app.use('/user', user);

module.exports = {
	path: '/api',
	handler: app
};
