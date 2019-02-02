const config = require('../config');
const {Router} = require('express');

const router = new Router();

router.get('/', (req, res) => {
	const {siteName, siteDescription} = config.store;

	res.json({
		siteName,
		siteDescription
	});
});

router.patch('/', requireACL('siteEdit'), (req, res) => {
	const {loginName} = req.loginName;
	const user = await db().collection('users').findOne({loginName});

	if(!req.authState || !user) {
		res.status(403).json({
			ok: false,
			reason: 'no-permission'
		});

		return;
	}

	const {name, description} = req.body;

	if(typeof name === 'string') {
		config.store.name = name;
	}

	if(typeof description === 'string') {
		config.store.description = description;
	}
});
