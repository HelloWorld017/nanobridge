<template>
	<div class="PostListing">
		<div class="PostListing__narrow">
			<div class="PostListing__chooser Chooser">
				<button class="Chooser__item" :class="{'Chooser__chosen': chosen === 1}" @click="choose(1)">
					글
				</button>

				<button class="Chooser__item" :class="{'Chooser__chosen': chosen === 2}" @click="choose(2)">
					앨범
				</button>

				<div class="Chooser__highlight"></div>
			</div>
		</div>

		<div class="PostListing__list">
			<template v-for="(post, index) in posts">
				<div class="PostListing__narrow">
					<post :key="`${post.postId}-post`" :post="post" :user="users[post.author]"></post>
				</div>

				<!--
					<div :key="`${post.postId}-divider}`" class="PostDivider" v-if="index !== posts.length - 1"></div>
				-->
			</template>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.PostListing {
		padding: 50px 0;

		&__chooser {
			width: 200px;
			height: 32px;
			border-radius: 16px;

			background: #202020;
		}

		&__narrow {
			max-width: 768px;
			width: 95vw;

			margin: 0 auto;
		}
	}

	.Chooser {
		display: flex;
		align-items: stretch;
		position: relative;

		&__item {
			position: relative;
			z-index: 2;

			display: flex;
			justify-content: center;
			align-items: center;
			flex: 1;

			color: #d0d0d0;
			font-family: 'Noto Sans CJK KR', sans-serif;
			font-size: .8rem;

			background: transparent;
			border: none;
			outline: none;
			transition: all .4s ease;

			&.Chooser__chosen {
				color: #202020;
			}

			&:not(.Chooser__chosen) {
				cursor: pointer;
			}
		}

		&__highlight {
			width: 50%;
			height: 32px;
			border-radius: 16px;
			position: absolute;

			background: #d0d0d0;
			transition: all .4s ease;
		}

		&__chosen:nth-child(1) ~ &__highlight {
			left: 0;
		}

		&__chosen:nth-child(2) ~ &__highlight {
			left: 50%;
		}
	}

	.PostDivider {

	}
</style>

<script>
	import Post from "./Post.vue";

	export default {
		data() {
			return {
				chosen: 1,
				currentPage: 1
			};
		},

		props: {
			context: {
				type: String,
				default: '/'
			},

			posts: {
				type: Array,
				default: []
			},

			users: {
				type: Object,
				default: {}
			}
		},

		methods: {
			choose(i) {
				this.chosen = i;
			},

			retrievePage(pageNo) {

			}
		},

		components: {
			Post
		}
	}
</script>
