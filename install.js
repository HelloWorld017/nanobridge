const config = require('./api/config');
const {database} = require('./api/database');
const {exists} = require('./api/utils');
const fs = require('fs');
const {promisify} = require('util');

const checkAndGenerate = async dir => {
	if(!await exists(dir)) {
		await promisify(fs.mkdir)(dir);
	}
};

(async () => {
	config.init();
	await database.init();

	const {db} = database;
	await db.createCollection('posts');
	await db.createCollection('users');
	await db.createCollection('registrationPhase');
	await db.collection('posts').createIndex({createdAt: -1});

	await checkAndGenerate('./static/uploads');
	await checkAndGenerate('./static/static_user');
	await checkAndGenerate('./static/static_post');

	console.log("Done Installing nanobridge!");
})();
