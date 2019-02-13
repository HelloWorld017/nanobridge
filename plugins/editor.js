import CodeFlask from "codeflask";
import Vue from "vue";

import Prism from "../assets/js/markdown";

Vue.prototype.$flaskEditor = editor => {
	const flask = new CodeFlask(editor, {
		language: 'markdown'
	});

	flask.highlight = function highlight() {
		Prism.highlightElement(this.elCode, false);
	};

	return flask;
};
