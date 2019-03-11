import cookie from 'cookie';

export default {
	state() {
		return {
			site: {},
			post: {}
		};
	},

	mutations: {
		setSiteInfo(state, configObject) {
			Object.keys(configObject).forEach(key => {
				if(key === 'ok') return;

				state[key] = configObject[key];
			});
		}
	},

	actions: {
		async nuxtServerInit({commit, dispatch}, ctx) {
			await dispatch('auth/nuxtServerInit', ctx);

			const {$axios} = ctx;
			const siteInfo = await $axios.$get('/api/site');
			commit('setSiteInfo', siteInfo);
		}
	}
};
