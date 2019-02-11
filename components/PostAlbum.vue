<template>
	<div class="PostAlbum" :id="`post-${post.postId}`">
		<a @click="showPost()" v-if="post.images.length > 0">
			<img :src="`/static_post/${post.postId}/${post.images[0].file}`">
		</a>
	</div>
</template>

<style lang="less" scoped>
	.PostAlbum {
		img {
			width: 200px;
			height: 200px;
			object-fit: cover;
			object-position: center;
		}
	}
</style>

<script>
	export default {
		props: {
			post: {
				type: Object,
				required: true
			}
		},

		methods: {
			showPost() {

			}
		}
	};
</script>
