import Vue from "vue";

Vue.prototype.$request = async function request(url, method = 'get', body = null) {
	const configuration = {
		url,
		method,
		headers: {}
	};

	if(process.client) {
		configuration.headers['Nanobridge-Authorization'] = localStorage.getItem('nanoBridgeToken');
	}

	if(body) {
		configuration.data = body;
	}

	configuration.method = method;

	const {data} = await this.$axios(configuration);
	return data;
};
