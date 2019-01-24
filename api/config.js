module.exports = {
	store: {},
	path: './config.json',

	generate() {
		this.store = {
			secret: Math.random().toString(36).slice(2).repeat(5).slice(0, Math.floor(Math.random() * 32) + 32),
			dburl: 'localhost',
			dbport: 27017,
			dbname: 'nanobridge'
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
