import cookie from 'cookie';

export default {
	state() {
		return {
			username: null,
			loginName: null,
			acl: []
		};
	},

	mutations: {
		setUser(state, {username, loginName, acl}) {
			state.username = username;
			state.loginName = loginName;
			state.acl = acl;
		}
	},

	actions: {
		async login({commit}, {loginName, password}) {
			const resp = await this.$axios.$post('/api/auth', {loginName, password});

			if(!resp.ok) {
				throw new Error(resp.reason);
			}

			const {token, username, acl} = resp;
			const cookieObject = {username, loginName, acl};

			commit('setUser', cookieObject);

			if(process.client) {
				const cookieStr = atob(JSON.stringify(cookieObject));
				document.cookie = `auth=${cookieStr}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
			}
		},

		async nuxtServerInit({commit}, {req, $axios}) {
			let authCookie = null;

			if(req && req.headers && req.headers.cookie) {
				const cookies = cookie.parse(req.headers.cookie);
				if(cookies.auth) {
					try {
						authCookie = JSON.parse(Buffer.from(cookies.auth, 'base64').toString('utf8'));
					} catch(e) {}
				}
			}

			if(!authCookie) {
				const {acl} = await $axios.$get('/api/auth');
				authCookie = {
					username: null,
					loginName: null,
					acl
				};
			}

			commit('setUser', authCookie);
		}
	},

	getters: {
		authState(state) {
			return state.loginName !== null;
		}
	}
};
