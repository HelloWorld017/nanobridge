export default {
	actions: {
		nuxtServerInit({commit}, {req}) {
			const auth = req.cookies.Authentication;
			let token = {};
			try {
				token = await promisify(jwt.verify)(auth, config.secret);
			} catch(err) {
				commit('setAuthState', false);
				return;
			}

			commit('setUser', username);
			commit('setAuthState', true);
		}
	}
}
