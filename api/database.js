const config = require('./config');

const EventEmitter = require('events');
const {MongoClient} = require('mongodb');

class Database extends EventEmitter {
	constructor() {
		super();
		this.initialized = false;
	}

	async init() {
		let mongoUrl = 'mongodb://';
		if(config.store.db.id) {
			mongoUrl += `${config.store.db.id}:${config.store.db.pw}@`;
		}
		mongoUrl += `${config.store.db.url}:${config.store.db.port}`;

		this.client = await MongoClient.connect(
			mongoUrl,
			{useNewUrlParser: true}
		);

		this.db = this.client.db(config.store.db.name);

		this.initialized = true;
		this.emit('init');
	}
};

const database = new Database();

module.exports = {
	database,
	db() {
		return database.db;
	}
};
