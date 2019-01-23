const config = require('./config');
const context = require('./context');
const cookieParser = require('cookie-parser');
const express = require('express');
const fs = require('fs');
const {routeList} = require('./functional');

const {Router} = require('express');

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

routeList.forEach(({route, methods}) => {
	const router = new Router();

	methods.forEach(({method, func}) => {
		router[method](route, (req, res) => {

		});
	});

	app.use(router);
});

module.exports = {
	path: '/api',
	handler: app
};
