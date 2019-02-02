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
	}
};
