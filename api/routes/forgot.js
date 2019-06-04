const {db} = require('../database');
const {Router} = require('express');

const router = new Router();
router.get('/id', async (req, res) => {
	//TODO expire link after 12hrs
	//TODO send template
});

router.get('/password/:username([a-zA-Z0-9]+)', async (req, res) => {

});

router.get('/email/:authToken', async (req, res) => {

});

module.exports = router;
