import Prism from "prismjs";

Prism.languages.markdown = Prism.languages.extend('markup', {});
Prism.languages.insertBefore('markdown', 'prolog', {
	'blockquote': {
		// > ...
		pattern: /^>(?:[\t ]*>)*/m,
		alias: 'punctuation'
	},
	'code': [
		{
			// Prefixed by 4 spaces or 1 tab
			pattern: /^(?: {4}|\t).+/m,
			alias: 'keyword'
		},
		{
			// `code`
			// ``code``
			pattern: /``.+?``|`[^`\n]+`/,
			alias: 'keyword'
		},
		{
			// ```optional language
			// code block
			// ```
			pattern: /^```[\s\S]*?^```$/m,
			greedy: true,
			inside: {
				'code-block': {
					pattern: /^(```.*(?:\r?\n|\r))[\s\S]+?(?=(?:\r?\n|\r)^```$)/m,
					lookbehind: true
				},
				'code-language': {
					pattern: /^(```).+/,
					lookbehind: true
				},
				'punctuation': /```/
			}
		}
	],
	'list': {
		// * item
		// + item
		// - item
		// 1. item
		pattern: /(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,
		lookbehind: true,
		alias: 'punctuation'
	},
	'bold': {
		// **strong**
		// __strong__

		// Allow only one line break
		pattern: /(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
		lookbehind: true,
		greedy: true,
		inside: {
			'punctuation': /^\*\*|^__|\*\*$|__$/
		}
	},
	'italic': {
		// *em*
		// _em_

		// Allow only one line break
		pattern: /(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
		lookbehind: true,
		greedy: true,
		inside: {
			'punctuation': /^[*_]|[*_]$/
		}
	},
	'strike': {
		// ~~strike through~~
		// ~strike~

		// Allow only one line break
		pattern: /(^|[^\\])(~~?)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
		lookbehind: true,
		greedy: true,
		inside: {
			'punctuation': /^~~?|~~?$/
		}
	},
	'mark': {
		// ==mark==

		// Allow only one line break
		pattern: /(^|[^\\])(==?)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
		lookbehind: true,
		greedy: true,
		inside: {
			'punctuation': /^==|==$/
		}
	},
	'ins': {
		// ++ins++

		// Allow only one line break
		pattern: /(^|[^\\])(\+\+?)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
		lookbehind: true,
		greedy: true,
		inside: {
			'punctuation': /^\+\+|\+\+$/
		}
	},
	'url': {
		// [example](http://example.com "Optional title")
		// [example] [id]
		pattern: /!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/,
		inside: {
			'variable': {
				pattern: /(!?\[)[^\]]+(?=\]$)/,
				lookbehind: true
			},
			'string': {
				pattern: /"(?:\\.|[^"\\])*"(?=\)$)/
			}
		}
	},
	'emoji': {
		pattern: /:[^`\n]+:/
	}
});

const inlineStyles = ['bold', 'italic', 'strike', 'mark', 'ins'];
const inlineExclusives = ['bold', 'italic', 'strike', 'mark', 'ins', 'url', 'emoji'];

inlineStyles.forEach(inline => {
	inlineExclusives.forEach(target => {
		Prism.languages.markdown[inline].inside[target] = Prism.languages.markdown[target];
	});
});

Prism.languages.md = Prism.languages.markdown;

export default Prism;
