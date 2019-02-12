const md = require('markdown-it');
const mdEmoji = require('markdown-it-emoji');
const mdIns = require('markdown-it-ins');
const mdMark = require('markdown-it-mark');

const markdown = md('zero')
	.set({
		breaks: true,
		linkify: true
	})
	.use(mdEmoji)
	.use(mdIns)
	.use(mdMark)
	.enable([
		'backticks', 'entity', 'emphasis',
		'link', 'linkify', 'newline', 'strikethrough',

		'code', 'blockquote', 'list' // Allow block-level elems?
	]);

module.exports = text => markdown.render(text);
