const units = ['', 'k', 'M', 'G', 'T'];

export default function prefix(n) {
	const nn = n.toExponential(2).split(/e/);
	const u = Math.max(0, Math.min(Math.floor(+nn[1] / 3), units.length - 1));

	return nn[0] * Math.pow(10, +nn[1] - u * 3) + units[u];
}
