const fs = require('fs');
const markdown = require('./markdown');
const {promisify} = require('util');

module.exports = {
	getImageExtension(mimetype) {
		let extension = 'png';
		switch(mimetype) {
			case 'image/jpeg':
				extension = 'jpg';
				break;

			case 'image/png':
				extension = 'png';
				break;

			case 'image/svg+xml':
				extension = 'svg';
				break;

			case 'image/gif':
				extension = 'gif';
				break;

			case 'image/webp':
				extension = 'webp';
				break;
		}

		return extension;
	},

	hexToDec(s) {
		function add(x, y) {
			var c = 0, r = [];
			var x = x.split('').map(Number);
			var y = y.split('').map(Number);
			while(x.length || y.length) {
				var s = (x.pop() || 0) + (y.pop() || 0) + c;
				r.unshift(s < 10 ? s : s - 10);
				c = s < 10 ? 0 : 1;
			}
			if(c) r.unshift(c);
			return r.join('');
		}

		var dec = '0';
		s.split('').forEach(function(chr) {
			var n = parseInt(chr, 16);
			for(var t = 8; t; t >>= 1) {
				dec = add(dec, dec);
				if(n & t) dec = add(dec, '1');
			}
		});

		return dec;
	},

	sanitizePostObject(post) {
		const keys = [
			'postId', 'content', 'images', 'author',
			'createdAt', 'replyTo'
		];

		const result = {};

		keys.forEach(key => {
			if(post[key] !== undefined) result[key] = post[key];
		});

		return result;
	},

	async exists(dir) {
		let exists = false;

		try {
			await promisify(fs.access)(dir);
			exists = true;
		} catch(e) {}

		return exists;
	},

	markdown,

	requireACL: (...aclNames) => (req, res, next) => {
		const satisfyRules = aclNames.every((name) => req.acl.includes(name));
		if(!satisfyRules) {
			res.status(403).json({
				ok: false,
				reason: 'no-permission'
			});
			return;
		}

		next();
	}
};
