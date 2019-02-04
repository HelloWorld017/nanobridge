import cookie from 'cookie';

export default {
	state() {
		return {
			username: null
		};
	},

	mutations: {
		setUser(state, username) {
			state.username = username;
		}
	},

	actions: {
		async login({commit}, {loginName, password}) {
			const resp = await this.$axios.$post('/api/auth', {loginName, password});

			if(!resp.data.ok) {
				throw new Error(resp.data.reason);
			}

			const {token, username} = resp.data;
			commit('setUser', username);

			if(process.client) {
				document.cookie = `username=${username}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
			}
		},

		async nuxtServerInit({commit}, {req}) {
			if(req && req.headers && req.headers.cookie) {
				const cookies = cookie.parse(req.headers.cookie);
				commit('setUser', cookies.username);
			}
		}
	},

	getters: {
		authState(state) {
			return state.username !== null;
		}
	}
};
