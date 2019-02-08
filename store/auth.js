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
			let resp = null;

			try {
				resp = await this.$axios.$post('/api/auth', {loginName, password});
			} catch(e) {
				if(e.response) resp = e.response.data;
				else throw e;
			}

			if(!resp.ok) {
				let readableReason = '';

				switch (resp.reason) {
					case 'wrong-id-or-password': readableReason = '잘못된 ID 또는 비밀번호'; break;
					case 'no-permission': readableReason = '로그인 할 권한이 없음'; break;
					default: readableReason = resp.reason;
				}
				throw new Error(readableReason);
			}

			const {token, username, acl} = resp;
			const cookieObject = {username, loginName, acl};

			commit('setUser', cookieObject);

			if(process.client) {
				const cookieStr = btoa(JSON.stringify(cookieObject));
				document.cookie = `auth=${cookieStr}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;

				localStorage.setItem('nanoBridgeToken', token);
			}
		},

		async logout({commit}) {
			const {acl} = await this.$axios.$get('/api/auth');

			commit('setUser', {username: null, loginName: null, acl});

			if(process.client) {
				document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
				localStorage.removeItem('nanoBridgeToken');
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
