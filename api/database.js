const config = require('./config');

const EventEmitter = require('events');
const {MongoClient} = require('mongodb');

class Database extends EventEmitter {
	constructor() {
		super();
		this.initialized = false;
	}

	async init() {
		this.client = await MongoClient.connect(
			`mongodb://${config.store.db.url}:${config.store.db.port}`,
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
