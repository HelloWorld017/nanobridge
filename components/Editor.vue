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
				</div>

				<div class="Editor__tools">
					<label class="Editor__tool Editor__upload mdi mdi-camera">
						<input type="file" multiple>
					</label>

					<div class="Editor__tool Editor__emoji EmojiChooser mdi mdi-sticker-emoji">
					</div>

					<div class="Editor__counter" :class="{'Editor__counter--insufficient': leftLength < 50}">
						{{leftLength}}
					</div>
				</div>

				<div class="Editor__uploads" :class="{'Editor__uploads--enabled': uploadEnabled}">
					<transition name="Fade">
						<div class="Editor__empty" v-if="!uploadEnabled">
							드래그 앤 드롭 · 붙여넣기 · 카메라 버튼 클릭
						</div>

						<div class="Editor__file" v-else v-for="image in uploadingImages">
						</div>
					</transition>
				</div>

				<transition name="Fade">
					<div class="Editor__dropzone Dropzone"
						:class="{'Dropzone--fail': dropzoneShake}"
						v-if="dropzone"
						@click="dropzone = false"
						@drop="handleDrop($event)">

						<span class="Dropzone__text">
							{{dropzoneMessage}}
						</span>
					</div>
				</transition>
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
			min-height: 120px;
			padding: 10px;

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

			margin: 0 10px;
			padding-bottom: 10px;
			border-bottom: 1px solid #303030;

			& > * {
				margin: 0 5px;
			}
		}

		&__tool {
			color: #a0a0a0;
			cursor: pointer;
			font-size: 1.4rem;
		}

		&__file {
			width: 75px;
			height: 75px;
		}

		&__uploads {
			display: flex;
			align-items: center;

			box-sizing: border-box;
			height: 120px;
			overflow: hidden;
			padding: 10px;

			transition: all .4s ease;
		}

		&__upload {
			display: inline-block;
			cursor: pointer;

			input {
				display: none;
			}
		}

		&__empty {
			display: flex;
			align-items: center;
			justify-content: center;
			flex: 1;
			height: 100%;

			color: #505050;
			font-family: 'Noto Sans CJK KR', sans-serif;
			font-weight: 400;
			font-size: 1.3rem;

			//border: 1px solid #00bcd4;
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

		&__counter {
			color: #d0d0d0;
			font-size: 1rem;
			font-weight: 400;
			font-family: 'Noto Sans CJK KR', sans-serif !important;
			transition: all .4s ease;

			&--insufficient {
				color: #f06292;
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
	}

	.Dropzone {
		position: absolute;
		top: -1px;
		left: -1px;
		width: ~"calc(100% + 2px)";
		height: ~"calc(100% + 2px)";
		box-sizing: border-box;
		padding: 10px;

		display: flex;
		align-items: center;
		justify-content: center;

		background: #202020;
		border: 1px solid #00acc1;
		border-radius: 10px;
		z-index: 3;

		&--fail {
			border-color: #f44336;

			.Dropzone__text {
				color: #f44336;
				animation-name: Shake;
				animation-duration: 100ms;
				animation-timing-function: ease-in-out;
				animation-iteration-count: 8;
			}
		}

		&__text {
			color: #d0d0d0;
			font-size: 2.5rem;
			font-family: 'Noto Sans CJK KR', sans-serif;
			font-weight: 700;
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
	import imageProcess from "../assets/js/imageprocess";
	import markdown from "../assets/js/markdown";
	import setDelay from "../assets/js/setdelay";

	export default {
		data() {
			return {
				currentAuthorName: this.$store.state.auth.loginName,
				users: {},
				content: '',
				editorHeight: 0,
				uploadingImages: [],
				dropzoneCounter: 0,
				dropzoneShake: false,
				dropzoneMessage: '여기 끌어다 놓으세요!'
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
			},

			dropzone: {
				get() {
					return this.dropzoneCounter > 0;
				},
				set(v) {
					return this.dropzoneCounter = +v;
				}
			}
		},

		methods: {
			async handleDrop(event) {
				try {
					await this.handleUploadTransfer(event.dataTransfer);
				} catch(e) {
					this.dropzoneShake = true;
					this.dropzoneMessage = '이미지 파일 말고는 주지 마세요!';

					setDelay(() => this.dropzone = false, 500, 'dropzoneFade');
					setDelay(() => this.dropzoneShake = false, 1000, 'dropzoneShake');
					setTimeout(() => {
						this.dropzoneMessage = '여기 끌어다 놓으세요!';
					}, 1500);
				}

				event.stopPropagation();
				event.preventDefault();
			},

			async handleUploadTransfer(dataTransfer) {
				const blobs = [];
				for(let item of dataTransfer.items) {
					if(item.kind !== 'file') continue;

					const blob = item.getAsFile();
					blobs.push(blob);
				}

				await this.handleUpload(blobs);
			},

			async handleUpload(blobs) {
				const processedImages = await imageProcess(blob);
				this.uploadingImages.push(...processedImages);
			},

			deleteUpload(index) {
				this.uploadingImages.splice(index, 1);
			},

			send() {

			}
		},

		async mounted() {
			document.addEventListener('paste', event => {
				const dataTransfer = event.clipboardData || window.clipboardData;
				this.handleUploadTransfer(dataTransfer);
			});

			document.addEventListener('dragenter', event => {
				this.dropzoneCounter++;
			});

			document.addEventListener('dragleave', event => {
				this.dropzoneCounter--;
			});

			document.addEventListener('dragover', event => {
				event.preventDefault();
			});

			document.addEventListener('drop', event => {
				this.dropzoneShake = true;
				setDelay(() => this.dropzone = false, 200, 'dropzoneFade');
				setDelay(() => this.dropzoneShake = false, 1000, 'dropzoneShake');

				event.preventDefault();
			}, true);

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
