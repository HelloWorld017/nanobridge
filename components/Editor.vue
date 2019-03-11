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
						<input type="file" accept="image/*" ref="fileinput" multiple @change="handleUploadDialog">
					</label>

					<div class="Editor__tool Editor__emoji EmojiChooser" v-click-outside="closeEmojiDialog">
						<a class="EmojiChooser__button" @click="emojiDialog = !emojiDialog">
							<i class="mdi mdi-sticker-emoji"></i>
						</a>

						<no-ssr>
							<transition name="Fade">
								<picker class="EmojiChooser__chooser"
									emoji="smile"
									title="이모지를 선택하세요"
									native
									:i18n="emojiI18n"
									v-if="emojiDialog"
									@select="addEmoji">
								</picker>
							</transition>
						</no-ssr>
					</div>

					<div class="Editor__counter" :class="{'Editor__counter--insufficient': leftLength < 50}">
						{{leftLength}}
					</div>
				</div>

				<div class="Editor__uploads" :class="{'Editor__uploads--enabled': uploadEnabled}">
					<transition name="Fade" mode="out-in">
						<div class="Editor__empty" v-if="!uploadEnabled">
							드래그 앤 드롭 · 붙여넣기 · 카메라 버튼 클릭
						</div>

						<transition-group name="TranslateGroup" tag="div" class="Editor__files" v-else>
							<div class="Editor__file" v-for="image in uploadingImages" :key="image.key">
								<img :src="image.url">
								<a class="Editor__file__delete" @click="deleteUpload(image.key)">
									<i class="mdi mdi-close-circle-outline"></i>
								</a>
							</div>
						</transition-group>
					</transition>
				</div>

				<transition name="Fade">
					<div class="Editor__dropzone Dropzone"
						:class="{'Dropzone--fail': dropzoneShake}"
						v-if="dropzone"
						@click="dropzone = false"
						@drop.stop.prevent="handleDrop($event)">

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
			display: inline-block;
			width: 75px;
			height: 75px;
			margin: 5px;
			position: relative;
			overflow: hidden;
			transition: transform .4s ease, opacity .4s ease;

			img {
				width: 83px;
				height: 83px;
				object-fit: cover;

				margin-top: -4px;
				margin-left: -4px;
				filter: blur(0);
				transition: filter .4s ease;
			}

			&__delete {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;

				display: flex;
				align-items: center;
				justify-content: center;

				color: #d0d0d0;
				font-size: 2rem;

				cursor: pointer;
				background: rgba(0, 0, 0, .6);
				opacity: 0;
				transition: all .4s ease;
			}

			&:hover {
				img {
					filter: blur(4px);
				}

				.Editor__file__delete {
					opacity: 1;
				}
			}
		}

		&__uploads {
			display: flex;
			align-items: center;

			box-sizing: border-box;
			min-height: 120px;
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

	.EmojiChooser {
		&__chooser {
			position: absolute;
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
		text-align: center;

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

	.emoji-mart-preview-emoji .emoji-mart-emoji span {
		display: flex !important;
		justify-content: center;
		align-items: center;

		font-size: 30px !important;
		margin-right: 5px;
	}
</style>

<script>
	import ClickOutside from 'vue-click-outside';
	import {Picker} from 'emoji-mart-vue';

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
				dropzoneMessage: '여기 끌어다 놓으세요!',

				emojiI18n: {
					search: '검색',
					notfound: '이모지가 없네요 :(',
					categories: {
						search: '검색 결과',
						recent: '주로 사용',
						people: '얼굴 & 사람',
						nature: '동물 & 자연',
						foods: '음식 & 음료',
						activity: '활동',
						places: '여행 & 장소',
						objects: '사물',
						symbols: '기호',
						flags: '국기',
						custom: '커스텀'
					}
				},
				emojiDialog: false
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

		props: {
			replyTo: {
				type: String,
				default: ''
			}
		},

		methods: {
			async handleUploadDialog(event) {
				const files = this.$refs.fileinput.files;
				if(!files) return;

				this.handleUpload(files);
				this.$refs.fileinput.files = [];
			},

			async handleDrop(event) {
				try {
					const {all, failed, exceed} = await this.handleUploadTransfer(event.dataTransfer);

					if(exceed > 0) {
						const error = new Error();
						error.exceedCount = exceed;
						error.isExceed = true;

						throw error;
					}

					if(failed > 0) {
						const error = new Error();
						error.failedCount = failed;
						error.all = all;
						error.isNotImage = true;

						throw error;
					}

					this.dropzone = false;
				} catch(e) {
					let message = '처리 과정에서 문제가 있었어요 T_T';

					if(e.isNotImage) {
						if(e.all === 1) {
							message = '저에게는 이미지만 넣어 주세요!';
						} else {
							message = `${e.failedCount}개는 이미지가 아니에요!`;
						}
					} else if(e.isExceed) {
						message = '이미지가 너무 많아요!';
					} else {
						console.error(e);
					}

					this.dropzoneShake = true;
					this.dropzoneMessage = message;

					setDelay(() => this.dropzone = false, 500, 'dropzoneFade');
					setDelay(() => this.dropzoneShake = false, 1000, 'dropzoneShake');
					setTimeout(() => {
						this.dropzoneMessage = '여기 끌어다 놓으세요!';
					}, 1500);
				}
			},

			async handleUploadTransfer(dataTransfer) {
				const blobs = [];
				for(let item of dataTransfer.items) {
					if(item.kind !== 'file') continue;

					const blob = item.getAsFile();
					blobs.push(blob);
				}

				const {failed, exceed} = await this.handleUpload(blobs);
				return {
					failed,
					exceed,
					all: blobs.length
				};
			},

			async handleUpload(blobs) {
				let exceed = 0;
				const maxImages = 32;
				const processedImages = await imageProcess(blobs);
				this.uploadingImages.push(...processedImages.results);

				const totalImages = this.uploadingImages.length;
				if(totalImages > maxImages) {
					this.uploadingImages = this.uploadingImages.slice(0, maxImages);
					exceed = totalImages - maxImages;
				}

				return {
					failed: processedImages.failed,
					exceed
				};
			},

			deleteUpload(key) {
				this.uploadingImages = this.uploadingImages.filter(v => v.key !== key);
			},

			async send() {
				const formData = new FormData();
				formData.append('author', this.currentAuthorName);
				formData.append('content', this.content);

				if(this.replyTo) {
					formData.append('replyTo', this.replyTo);
				}

				if(this.uploadEnabled) {
					this.uploadingImages.forEach(image => {
						formData.append('images', image.blob);
					});
				}

				await this.$request('/api/post', 'post', formData);

				this.uploadingImages.forEach(image => {
					image.revoke();
				});

				this.content = '';
				this.uploadingImages = [];

				this.$emit('send');
			},

			addEmoji(emoji) {
				this.content += emoji.native;
			},

			closeEmojiDialog() {
				this.emojiDialog = false;
			}
		},

		async mounted() {
			document.addEventListener('paste', event => {
				const dataTransfer = event.clipboardData || window.clipboardData;
				window.finalTransfer = dataTransfer;
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
		},

		components: {
			Picker
		},

		directives: {
			ClickOutside
		}
	};
</script>
