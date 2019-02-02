const fs = require('fs');

module.exports = {
	store: {},
	path: './config.json',

	generate() {
		this.store = {
			secret: [...Array(5)]
				.map(() => Math.random().toString(36).slice(2))
				.join('')
				.slice(0, Math.floor(Math.random() * 32) + 32),

			user: {
				maxSubUsers: 5,
				createToken: Math.random().toString(36).slice(2, 10),
			},

			db: {
				url: 'localhost',
				port: 27017,
				name: 'nanobridge'
			},

			site: {
				name: 'Nano Bridge',
				description: 'A microblogging application'
			},

			acl: {
				default: [
					'authGenerate', 'userUpdate', 'subuserCreate',
					'postRead', 'postWrite', 'postUpdate', 'postDelete'
				],
				guest: ['postRead'],
				admin: [
					'admin', 'siteEdit', 'userACL', 'authAnyone'
				]
			}
		};

		this.save();
	},

	load(configPath) {
		let confPath = configPath || this.path;
		this.path = confPath;

		this.store = JSON.parse(fs.readFileSync(confPath, 'utf8'));
	},

	save() {
		fs.writeFileSync(this.path, JSON.stringify(this.store, null, '\t'));
	},

	init() {
		if(!fs.existsSync('./config.json')) {
			this.generate();
		} else {
			this.load();
		}
	}
};
