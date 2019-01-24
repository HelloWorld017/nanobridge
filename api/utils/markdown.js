const marked = require('marked');
const {InlineLexer, Lexer, Renderer} = require('marked');

const whitelist = ['text', 'br', 'codespan', 'em', 'del', 'link', 'strong'];

module.exports = () => {
	const list = [
		'code', 'blockquote', 'html', 'heading', 'hr', 'list', 'listitem',
		'paragraph', 'table', 'tablerow', 'tablecell', 'strong', 'em',
		'codespan', 'br', 'del', 'link', 'image', 'text'
	];

	const blacklist = list.filter(item => !whitelist.includes(item));
	blacklist.forEach(key => {
		if(Lexer.rules[key]) {
			Lexer.rules[key].exec = () => {};
		}

		if(InlineLexer.rules[key]) {
			InlineLexer.rules[key].exec = () => {};
		}
	});

	const renderer = new Renderer();
	renderer.code = (code, infostring, escaped) => {
		return (escaped ? code : escape(code, true));
	};

	marked.setOptions({
		breaks: true,
		gfm: true,
		sanitize: true,
		renderer
	});

	return marked;
};
