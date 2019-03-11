import owasp from "owasp-password-strength-test";

const translations = {
	0: "비밀번호는 최소 10자리 이상이어야 합니다.",
	1: "비밀번호는 128자리 이하여야 합니다.",
	2: "비밀번호는 3개 이상의 반복된 문자를 가져서는 안됩니다.",
	3: "비밀번호는 20자리 이상이 되거나 1개 이상의 소문자를 담고 있어야 합니다.",
	4: "비밀번호는 20자리 이상이 되거나 1개 이상의 대문자를 담고 있어야 합니다.",
	5: "비밀번호는 20자리 이상이 되거나 1개 이상의 숫자를 담고 있어야 합니다.",
	6: "비밀번호는 20자리 이상이 되거나 1개 이상의 특수문자를 담고 있어야 합니다."
};

const mix = (ratio, start, end) => [...Array(start.length)].map((_, i) => start[i] * ratio + end[i] * ratio);

export default password => {
	const {failedTests, passedTests} = owasp.test(password);
	const ignoringTests = [2];

	const failedFiltered = failedTests.filter(v => !ignoringTests.includes(v));
	const passedFiltered = failedTests.filter(v => !ignoringTests.includes(v));
	const testsFiltered = failedFiltered.concat(passedFiltered);

	const strength = Math.floor((passedFiltered.length / failedFiltered.length) * 100) / 100;
	const passed = failedTests.length > 0;
	const failedReason = passed ? '' : translations[failedTests[0]];

	const startingColor = [244, 67, 54];
	const endColor = [139, 195, 74];
	const color = `rgb(${mix(strength, startingColor, endColor).join(', ')}`;

	return {
		percentage: strength,
		passed,
		failedReason,
		color
	};
};
