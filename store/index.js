import cookie from 'cookie';

export default {
	actions: {
		async nuxtServerInit({dispatch}, ctx) {
			await dispatch('auth/nuxtServerInit', ctx);
			await dispatch('site/nuxtServerInit', ctx);
		}
	}
};
