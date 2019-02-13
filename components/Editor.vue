<template>
	<section class="Editor Container" @keydown.ctrl.enter.prevent="send">
		<div class="Editor__message">
			<div class="Editor__author AuthorChooser">
				<img class="AuthorChooser__current" :src="currentAuthor.profile"  v-if="currentAuthor">
			</div>

			<div class="Editor__area">
				<div class="Editor__input" ref="editor" :style="{height: editorHeight}"></div>

				<div class="Editor__uploads" :class="{'Editor__uploads--enabled': uploadEnabled}"></div>

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
			margin-left: auto;
			margin-right: 10px;
			margin-bottom: 10px;

			& > * {
				color: #a0a0a0;
				cursor: pointer;
				font-size: 1.2rem;
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
			padding: 10px;

			transition: all .4s ease;

			&--enabled {
				height: 100px;
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
</style>

<style lang="less">
	.Editor {
		.codeflask {
			position: relative;
			width: initial;
			height: initial;
			flex: 1;
			background: transparent;

			&__textarea {
				caret-color: #808080;
				color: transparent !important;
				overflow: hidden;
			}

			&__code, &__textarea {
				color: #f0f0f0;
				font-family: 'Noto Sans CJK KR', sans-serif !important;
			}

			&__flatten {
				white-space: pre-wrap;
			}
		}

		.language-markdown {
			.mark {
				background: #4dd0e1;
			}

			.code {
				background: #303030;
				color: #d0d0d0 !important;

				& > .punctuation {
					color: #d0d0d0 !important;
				}
			}

			.bold {
				font-weight: 700;
				font-size: .79rem;
			}

			.ins {
				text-decoration: underline;
			}

			.strike {
				text-decoration: line-through;
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

			const flask = this.$flaskEditor(this.$refs.editor);
			flask.onUpdate(code => {
				this.content = code;

				const textarea = flask.elTextarea;
				this.editorHeight = 'auto';
				this.$nextTick(() => {
					this.editorHeight = `${textarea.scrollHeight + 12}px`
				});
			});

			this.$flask = flask;
		}
	};
</script>
