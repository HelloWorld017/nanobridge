const config = require('config');
const ejs = require('ejs');
const fs = require('fs');

const TemplateFile = fs.readFileSync('./assets/template/mail.html', 'utf8');

class Template {
	constructor(context) {
		this.ctx = context;
		this.ctx.site = config.store.site;
	}

	get username() {
		return this.ctx.username;
	}

	get sitename() {
		return this.ctx.site.name;
	}

	render() {
		return ejs.render(TemplateFile, this);
	}
}

class EmailAuthTemplate extends Template {
	constructor(context) {
		super(context);
	}

	get title() {
		return '이메일 인증'
	}

	get content() {
		return `${this.ctx.site.name}에 오신 것을 환영합니다!\n\n` +
			'회원가입 완료를 위해서는 이메일 인증이 필요합니다.\n' +
			'이메일이 인증되지 않은 경우, 계정은 비활성화 상태로 대부분의 작업이 불가하게 됩니다.\n\n' +
			'다음 링크 또는 버튼을 클릭하셔서 회원가입의 마지막 단계를 밟아주시면 감사하겠습니다.';
	}

	get link() {
		return `${this.ctx.site.url}/auth/email/${this.ctx.token}`
	}

	get linktext() {
		return '이메일 인증하기';
	}
}

export default {EmailAuthTemplate};
