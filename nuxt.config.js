module.exports = {
	head: {
		title: 'nanobridge',
		meta: [
			{
				charset: 'utf-8'
			},

			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1'
			},

			{
				hid: 'description',
				name: 'description',
				content: 'A microblog application'
			}
		],

		link: [
			{
				rel: 'icon',
				type: 'image/x-icon',
				href: '/favicon.ico'
			}
		]
	},

	loading: {
		color: '#3B8070'
	},

	css: [
		{src: '~/assets/less/index.less', lang: 'less'}
	],

	build: {
		extend(config, {isDev, isClient}) {
			if (isDev && isClient) {

			}
		}
	},

	renderer: {
		csp: {
			polycies: {
				'script-src': 'self'
			}
		}
	},

	serverMiddleware: [
		'~/api/index.js'
	],

	modules: [
		'@nuxtjs/axios',
		'nuxt-svg'
	]
};
