module.exports = {
	state() {
		return {
			username: '',
			authState: false
		};
	},

	mutations: {
		setUser(state, username) {
			state.username = username;
		},

		setAuthState(state, authState) {
			state.authState = authState;
		}
	},

	actions: {
		async nuxtServerInit({commit}, {req}) {
			const auth = req.cookies.Authentication;
			let token = {};
			try {
				token = await promisify(jwt.verify)(auth, config.secret);
			} catch(err) {
				commit('setAuthState', false);
				return;
			}

			commit('setUser', token.username);
			commit('setAuthState', true);
		}
	}
};
