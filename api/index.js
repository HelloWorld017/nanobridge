const config = require('./config');
const context = require('./context');
const cookieParser = require('cookie-parser');
const express = require('express');
const fs = require('fs');

//Routes
const auth = require('./routes/auth');
const post = require('./routes/post');
const user = require('./routes/user');

if(!fs.existsSync('./config.json')) {
	config.generate();
} else {
	config.load();
}

const app = express();
app.use(cookieParser());
app.use(async (req, res, next) => {
	const {ctx, methods} = await context(req);
	req.context = ctx;
	req.ctxMethods = methods;

	next();
});

app.use('/auth', auth);
app.use('/post', post);
app.use('/user', user);

module.exports = {
	path: '/api',
	handler: app
};
