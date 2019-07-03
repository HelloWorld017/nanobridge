const deepmerge = require('deepmerge');
const fs = require('fs');

module.exports = {
	store: {},
	path: './config.json',
	default: {
		$secret: [...Array(5)]
			.map(() => Math.random().toString(36).slice(2))
			.join('')
			.slice(0, Math.floor(Math.random() * 32) + 32),

		user: {
			maxSubUsers: 5,
			$createToken: Math.random().toString(36).slice(2, 10)
		},

		db: {
			url: 'localhost',
			port: 27017,
			name: 'nanobridge'
		},

		site: {
			name: 'nano[bridge]',
			description: '단정하고 간결한 글나눔터',
			landingText: '와 함께 소소한 일상을',
			url: 'localhost'
		},

		post: {
			maxLength: 200
		},

		listing: {
			postsPerPage: 10,
			albumsPerPage: 30,
			countingPages: 100
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
	},

	generate() {
		this.store = deepmerge({}, this.default);
		this.save();
	},

	load(configPath) {
		let confPath = configPath || this.path;
		this.path = confPath;

		try {
			this.store = deepmerge(
				this.default,
				JSON.parse(fs.readFileSync(confPath, 'utf8')),
				{arrayMerge: (dest, source, opt) => source}
			);
		} catch(e) {
			if(fs.existsSync(confPath)) {
				console.error("Error while reading configuration file!");
				throw new Error("Error while reading configuration file!");
			}

			console.log("Generated new configuration file.");
			this.store = deepmerge({}, this.default);
		}

		this.save();
	},

	save() {
		fs.writeFileSync(this.path, JSON.stringify(this.store, null, '\t'));
	},

	init() {
		this.load();
	}
};
