const {Router} = require('express');

const router = new Router();

router.get('/', (req, res) => {
	res.json({
		ok: true,
		result: req.authState
	});
});

router.post('/', (req, res) => {
	const {username, password} = req.body;
	if(typeof username !== 'string' || typeof password !== 'string') {
		res.status(400).json({ok: false});
		return;
	}

	req.database.
});

router.delete('/', (req, res) => {
	res.cookie('Authentication', '', {
		expires: new Date(0)
	});
});

module.exports = router;
