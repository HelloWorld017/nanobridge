const config = require('../config');
const {requireACL} = require('../utils');
const {Router} = require('express');

const router = new Router();

router.get('/', (req, res) => {
	const {name, description, landingText} = config.store.site;

	res.json({
		ok: true,
		name,
		description,
		landingText,
		registerEnabled: !config.store.user.createToken
	});
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
