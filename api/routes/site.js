const config = require('../config');
const {requireACL} = require('../utils');
const {Router} = require('express');

const router = new Router();

router.get('/', (req, res) => {
	const {name, description} = config.store.site;

	res.json({
		ok: true,
		name,
		description,
		registerEnabled: !config.store.user.createToken
	});
});

router.patch('/', requireACL('siteEdit'), (req, res) => {
	const {name, description} = req.body;

	if(typeof name === 'string') {
		config.store.site.name = name;
	}

	if(typeof description === 'string') {
		config.store.site.description = description;
	}

	config.save();

	res.json({
		ok: true
	});
});

module.exports = router;
