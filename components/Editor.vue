<template>
	<form class="Editor Container">
		<div class="Editor__author AuthorChooser">
			<img class="AuthorChooser__current" :src="currentAuthor.profile"  v-if="currentAuthor">
		</div>

		<div class="Editor__area">
			<div class="Editor__input">
				<textarea class="Editor__fake" v-model="originalText"></textarea>

				<div class="Editor__content" v-html="markdown"></div>
			</div>

			<div class="Editor__uploads">
			</div>

			<div class="Editor__tools">
				<div class="Editor__emoji EmojiChooser">
				</div>

				<div class="Editor__send">
					<i class="mdi mdi-send"></i>
				</div>
			</div>
		</div>
	</form>
</template>

<style lang="less" scoped>
	.Editor {
		display: flex;
		margin-bottom: 50px;

		&__area {
			display: flex;
			flex: 1;
			height: 10vh;
			margin-left: 10px;
			position: relative;
		}

		&__input {
			position: relative;
			flex: 1;
			align-items: stretch;
			padding: 10px;

			color: #d0d0d0;
			font-family: 'Noto Sans CJK KR', sans-serif;
			font-size: .8rem;

			background: #202020;
			border: 1px solid #00bcd4;
			border-radius: 10px;

			outline: none;
			resize: none;
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
			position: absolute;
			bottom: 10px;
			right: 10px;

			color: #a0a0a0;
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

<script>
	import markdown from "../assets/js/markdown";

	export default {
		data() {
			return {
				currentAuthorName: this.$store.state.auth.loginName,
				uploadingImages: [],
				users: {},
				originalText: ''
			};
		},

		computed: {
			currentAuthor() {
				return this.users[this.currentAuthorName];
			},

			markdown() {
				return markdown(this.originalText);
			}
		},

		methods: {
			handleUploadTransfer(dataTransfer) {

			},

			handleUpload(blobs) {

			}
		},

		async mounted() {
			document.addEventListener('paste', event => {
				const dataTransfer = event.clipboardData || event.originalEvent.clipboardData;
				this.handleUploadTransfer(dataTransfer);
			});

			const {users} = await this.$request(`/api/user/${this.$store.state.auth.loginName}/subuser`);
			this.users = users;
		}
	};
</script>
