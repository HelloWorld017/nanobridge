export default {
	state() {
		return {
			name: '',
			description: '',
			landingText: '',
			registerEnabled: false
		};
	},

	mutations: {
		setSiteInfo(state, {name, description, landingText, registerEnabled}) {
			state.name = name;
			state.description = description;
			state.landingText = landingText;
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
