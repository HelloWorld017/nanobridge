<template>
	<div class="Post" :id="`post-${post.postId}`">
		<img class="Post__profile" :src="user.profile" :alt="user.username">
		<div class="Post__column">
			<div class="Post__author">
				<span class="Post__username">
					{{user.username}}
				</span>

				<span class="Post__loginname">
					@{{user.loginName}}
				</span>

				<span class="Post__divider">
					/
				</span>

				<time class="Post__date" :datetime="toIsoTime(post.createdAt)">{{toReadable(post.createdAt)}}</time>
			</div>
			<div class="Post__content Markdown" v-html="post.content"></div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.Post {
		display: flex;
		margin: 30px;
		margin-bottom: 48px;

		color: #d0d0d0;
		font-family: 'Noto Sans CJK KR', sans-serif;

		&__profile {
			width: 64px;
			height: 64px;
			border-radius: 50%;
			object-fit: cover;
		}

		&__column {
			padding-left: 16px;
		}

		&__username {
			font-size: 1.2rem;
			color: #4dd0e1;
		}

		&__loginname {
			font-size: 0.8rem;
			color: #a1a2a3;
		}

		&__date {
			font-size: 0.8rem;
			color: #a1a2a3;
		}
	}
</style>

<style lang="less">
	.Markdown {
		mark {
			background: #4dd0e1;
			padding: 0 3px;
		}

		code {
			background: #d0d0d0;
			color: #202020;
			font-family: 'Fira Code', 'D2Coding', monospace;
			margin: 0 3px;
			padding: 2px 3px;
			border-radius: 3px;
		}
	}
</style>

<script>
	export default {
		props: {
			post: {
				type: Object,
				required: true
			},

			user: {
				type: Object,
				required: true
			}
		},

		methods: {
			toIsoTime(unix) {
				return new Date(unix).toISOString();
			},

			toReadable(unix) {
				const date = new Date(unix);
				return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
			}
		}
	};
</script>
