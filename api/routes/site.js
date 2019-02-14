const config = require('../config');
const deepmerge = require('deepmerge');
const {requireACL, sanitizeConfigObject} = require('../utils');
const {Router} = require('express');

const router = new Router();

router.get('/', (req, res) => {
	const allowedKeys = ['site', 'post'];
	const sanitizedConfig = {};
	allowedKeys.forEach(key => sanitizedConfig[key] = sanitizeConfigObject(config.store[key]));

	const computedConfig = {
		site: {
			registerEnabled: !config.store.user.$createToken.length
		}
	};

	res.json(deepmerge.all([
		{ok: true},
		computedConfig,
		sanitizedConfig
	]));
});

router.patch('/', requireACL('siteEdit'), (req, res) => {
	const {name, description, landingText} = req.body;

	if(typeof name === 'string') {
		config.store.site.name = name;
	}

	if(typeof description === 'string') {
		config.store.site.description = description;
	}

	if(typeof landingText === 'string') {
		config.store.site.landingText = landingText;
	}

	config.save();

	res.json({
		ok: true
	});
});

module.exports = router;
