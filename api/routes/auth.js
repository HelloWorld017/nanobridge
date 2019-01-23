export default {
	name: 'auth',
	route: '/auth'

	init() {},

	get: ctx => {

	},

	post: (ctx, {id, password}) => {

	},

	delete: ctx => {
		delete ctx.username;
		ctx.authState = false;
		res.cookie('Authentication', '', {
			expires: new Date(0)
		});
	}
};

setLoggedIn({ctx, res}, username) {
	const token = await promisify(jwt.sign)({username}, config.secret, {
		algorithm: 'HS256'
	});

	ctx.username = username;
	ctx.authState = true;
	res.cookie('Authentication', token, {
		maxAge: 1000 * 60 * 60 * 24 * 365
	});
},

setLoggedOut({ctx, res}) {
	delete ctx.username;
	ctx.authState = false;
	res.cookie('Authentication', '', {
		expires: new Date(0)
	});
}
