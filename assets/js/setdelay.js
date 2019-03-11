const delayoutStore = [];

export default (cb, timeout, key) => {
	const current = Date.now();
	delayoutStore[key] = current;

	setTimeout(() => {
		if(delayoutStore[key] === current) {
			cb();
		}
	}, timeout);
};
