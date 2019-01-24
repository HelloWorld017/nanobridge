const crypto = require('crypto');
const database = require('../database');
const {hexToDec, getImageExtension} = require('../utils');
const multer = require('multer');
const path = require('path');
const {promisify} = require('util');
const {Router} = require('express');

const router = new Router();
const upload = multer({
	dest: path.resolve(__dirname, '..', '..', './static/uploads/'),
	limits: {
		fields: 512,
		fileSize: 10 * 1024 * 1024,
		files: 32,
		parts: 128
	}
});

router.get('/', (req, res) => {

});

router.post('/', upload.array('images', 32), async (req, res) => {
	if(!req.authState) {
		res.status(403).json({
			ok: false,
			reason: 'not-authenticated'
		});
		return;
	}

	const {content} = req.body;

	const postIdGen = (Date.now() * 100).toString(16) + Math.floor(Math.random() * 100).toString(16);
	const postId = hexToDec(crypto.createHash('md5').update(postIdGen).digest('hex'));

	req.files.forEach(v => {

	});
});

router.patch('/:postId/', upload.array('addImages', 32), async (req, res) => {
	const {content, deleteImages} = req.body;
});

router.delete('/:postId/', async (req, res) => {

});

module.exports = router;
