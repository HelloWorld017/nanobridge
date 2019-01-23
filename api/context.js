const config = require('./config');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');

const contexts = [
	{
		name: 'authState',
		async init(ctx, req) {
			const auth = req.cookies.Authentication;
			let token = {};
			try {
				token = await promisify(jwt.verify)(auth, config.secret);
			} catch(err) {
				ctx.authState = false;
				return;
			}

			ctx.username = token.username;
			ctx.authState = true;
		}
	}
];

const contextMethods = {};
contexts.forEach(context => {
	Object.assign(contextMethods, context.methods);
});

module.exports = async (req) => {
	const context = {};

	for(contextInitializer of contexts) {
		await contextInitializer.init(context, req);
	}

	return {
		ctx: context,
		methods: contextMethods
	};
};
