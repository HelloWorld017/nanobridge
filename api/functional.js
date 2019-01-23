const routes = require('./routes');
const methods = ['get', 'post', 'patch', 'delete'];

const routeList = Object.keys(routes).map(k => {
	const route = routes[k];
	route.init();

	const routeObject = {
		name: route.name,
		pascalName: route.name[0].toUpperCase() + route.name.slice(1),
		route: route.route,
		methods: []
	};

	methods.forEach(method => {
		if(route[method]) {
			routeObject.methods.push({
				method,
				func: route[method].bind(route)
			});
		}
	});

	return routeObject;
});

module.exports = routeList.reduce((apiList, route) => {
	route.methods.forEach(({method, func}) => {
		apiList[`${method}${route.pascalName}`] = func;
	});

	return apiList;
}, {});

module.exports.routeList = routeList;
