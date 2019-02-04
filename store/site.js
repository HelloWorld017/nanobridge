export default {
	state() {
		return {
			name: '',
			description: '',
			registerEnabled: false
		};
	},

	mutations: {
		setSiteInfo(state, {name, description, registerEnabled}) {
			state.name = name;
			state.description = description;
			state.registerEnabled = registerEnabled;
		}
	},

	actions: {
		async nuxtServerInit({commit}, {req, $axios}) {
			const siteInfo = await $axios.$get('/api/site');
			commit('setSiteInfo', siteInfo);
		}
	}
};
