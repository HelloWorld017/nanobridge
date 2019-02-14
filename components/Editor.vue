<template>
	<section class="Editor Container" @keydown.ctrl.enter.prevent="send">
		<div class="Editor__message">
			<div class="Editor__author AuthorChooser">
				<img class="AuthorChooser__current" :src="currentAuthor.profile"  v-if="currentAuthor">
			</div>

			<div class="Editor__area">
				<div class="Editor__input Schale" ref="schale" :style="{height: editorHeight}">
					<textarea
						class="Schale__textarea Schale__flatten"
						ref="schaleTextarea"
						v-model="content"
						@input="content = $event.target.value"
						spellcheck="false" autocapitalize="off"
						autocorrect="off" autocomplete="off">
					</textarea>

					<div class="Schale__code Schale__flatten SchalePreview" v-html="code"></div>

					<div class="Schale__counter" :class="{'Schale__counter--insufficient': leftLength < 50}">
						{{leftLength}}
					</div>
				</div>

				<div class="Editor__uploads" :class="{'Editor__uploads--enabled': uploadEnabled}">
					<div class="Editor__file" v-for="image in uploadingImages">
					</div>
				</div>

				<div class="Editor__tools">
					<label class="Editor__upload mdi mdi-camera">
						<input type="file" multiple>
					</label>

					<div class="Editor__emoji EmojiChooser">
					</div>
				</div>
			</div>
		</div>

		<button class="Editor__send" :class="{'Editor__send--enabled': sendEnabled}" @click="send">
			<i class="mdi mdi-send"></i> 전송
		</button>
	</section>
</template>

<style lang="less" scoped>
	.Editor {
		display: flex;
		flex-direction: column;
		margin-bottom: 50px;

		&__message {
			display: flex;
			margin-bottom: 10px;
		}

		&__area {
			position: relative;
			min-height: 10vh;
			margin-left: 10px;

			display: flex;
			flex-direction: column;
			flex: 1;

			background: #202020;
			border: 1px solid #00acc1;
			border-radius: 10px;
		}

		&__input {
			position: relative;
			min-height: 10vh;
			padding: 10px;
			border-bottom: 1px solid #303030;

			display: flex;
			flex: 1;
			align-items: stretch;

			color: #d0d0d0;
			font-family: 'Noto Sans CJK KR', sans-serif;
			font-size: .8rem;
		}

		&__fake {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			width: 100%;

			background: transparent;
			color: transparent;
			border: none;
			outline: none;
			resize: none;
			z-index: 1;
		}

		&__tools {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			margin: 5px 10px;

			& > * {
				color: #a0a0a0;
				cursor: pointer;
				font-size: 1.4rem;
			}
		}

		&__file {
			width: 75px;
			height: 75px;
		}

		&__uploads {
			display: flex;
			align-items: center;

			box-sizing: border-box;
			height: 0;
			overflow: hidden;
			padding: 0;

			transition: all .4s ease;

			&--enabled {
				height: 100px;
				padding: 10px;
			}
		}

		&__upload {
			display: inline-block;
			cursor: pointer;

			input {
				display: none;
			}
		}

		&__send {
			align-self: flex-end;
			padding: 10px 30px;

			color: rgba(255, 255, 255, .8);
			font-family: 'Noto Sans CJK KR', sans-serif;

			cursor: not-allowed;
			background: #303030;
			border: none;
			border-radius: 500px;
			outline: none;
			transition: all .4s ease;

			&--enabled {
				cursor: pointer;
				background: #00bcd4;
			}
		}
	}

	.AuthorChooser {
		&__current {
			width: 50px;
			height: 50px;
			border-radius: 50%;
		}
	}

	.Schale {
		position: relative;
		width: initial;
		height: initial;
		overflow: hidden;
		flex: 1;

		background: transparent;
		box-sizing: border-box;

		* {
			box-sizing: border-box;
		}

		&__textarea {
			background: none;
			border: none;
			caret-color: #808080;
			color: transparent;
			font-family: 'Noto Sans CJK KR', sans-serif !important;
			overflow: hidden;
			resize: none;
			width: 100%;
			height: 100%;
			z-index: 2;

			&::selection {
				background: #00bcd4;
				color: #fff;
			}
		}

		&__code {
			color: #f0f0f0;
			display: block;
			font-family: 'Noto Sans CJK KR', sans-serif !important;
			pointer-events: none;
			overflow: hidden;
			overflow-wrap: break-word;
			width: 100%;
			z-index: 0;
		}

		&__flatten {
			position: absolute;
			top: 0;
			left: 0;
			overflow: hidden;
			margin: 0 !important;
			outline: none;
			text-align: left;

			padding: 20px;
			font-size: 13px;
			line-height: 1.25rem;
			white-space: pre-wrap;
		}

		&__counter {
			position: absolute;
			bottom: 10px;
			right: 10px;

			color: #d0d0d0;
			font-weight: 400;
			font-family: 'Noto Sans CJK KR', sans-serif !important;
			transition: all .4s ease;

			&--insufficient {
				color: #f06292;
			}
		}
	}
</style>

<style lang="less">
	.FakeBold(@color) {
		text-shadow: 0.7px 0 0 @color, 0.2px 0 0.2px @color, -0.2px 0 0.2px @color;
	}

	.SchalePreview {
		.mark {
			background: #4dd0e1;
			color: #202020;

			.url {
				.variable {
					color: #4a148c;
				}

				.urlstring {
					color: #6a1b9a;
				}
			}

			.token.punctuation {
				color: #00838f;
			}
		}

		.code {
			background: #303030;
			color: #d0d0d0 !important;

			& > .punctuation {
				color: #d0d0d0 !important;
			}
		}

		.ins {
			text-decoration: underline;
		}

		.strike {
			text-decoration: line-through;
			color: #606060;
		}

		.emoji {
			background: #ffc107;
			color: #303030;
		}

		.token.punctuation {
			color: #606060;
		}

		.italic {
			font-style: italic;
		}

		.url {
			.variable {
				color: #ec407a;
				text-decoration: underline;
			}

			.urlstring {
				color: #f48fb1;
			}
		}

		//Fake Bold (Becauseof position mismatch)
		.bold {
			.FakeBold(#f0f0f0);


			.url {
				.variable {.FakeBold(#ec407a);}
				.urlstring {.FakeBold(#f48fb1);}
			}

			.mark {
				.FakeBold(#202020);
				.url {
					.variable {.FakeBold(#4a148c);}
					.urlstring {.FakeBold(#6a1b9a);}
				}
				.token.punctuation {.FakeBold(#00838f);}
			}

			.strike, .punctuation {.FakeBold(#606060);}
			.code {.FakeBold(#d0d0d0);}
			.emoji {.FakeBold(#303030);}
		}

		.mark {
			.bold {.FakeBold(#202020);}
		}

		.strike {
			.bold {.FakeBold(#606060);}
		}
	}
</style>

<script>
	import markdown from "../assets/js/markdown";

	export default {
		data() {
			return {
				currentAuthorName: this.$store.state.auth.loginName,
				content: '',
				uploadingImages: [],
				users: {},
				editorHeight: 0
			};
		},

		computed: {
			currentAuthor() {
				return this.users[this.currentAuthorName];
			},

			uploadEnabled() {
				return this.uploadingImages.length > 0;
			},

			sendEnabled() {
				return this.uploadEnabled || (this.content.length > 0);
			},

			code() {
				return markdown.highlight(this.content, markdown.languages.markdown, 'markdown');
			},

			leftLength() {
				return this.maxLength - this.content.length;
			},

			maxLength() {
				return 200;
			}
		},

		methods: {
			handleUploadTransfer(dataTransfer) {

			},

			handleUpload(blobs) {

			},

			send() {

			}
		},

		async mounted() {
			document.addEventListener('paste', event => {
				const dataTransfer = event.clipboardData || event.originalEvent.clipboardData;
				this.handleUploadTransfer(dataTransfer);
			});

			const {users} = await this.$request(`/api/user/${this.$store.state.auth.loginName}/subuser`);
			this.users = users;
		},

		watch: {
			content(newValue) {
				if(newValue.length > this.maxLength) {
					this.content = newValue.slice(0, 200);
					return;
				}

				const textarea = this.$refs.schaleTextarea;
				this.editorHeight = 'auto';
				this.$nextTick(() => {
					this.editorHeight = `${textarea.scrollHeight + 12}px`
				});
			}
		}
	};
</script>
