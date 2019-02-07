<template>
	<main class="Container">
		<navigation connect-header></navigation>
		<header class="Header" :class="{'Header-full': registerEnabled}">
			<div class="Header__background"></div>
			<div class="Landing">
				<h1 class="Landing__title">nano[bridge]</h1>
				<p class="Landing__description">와 함께 소소한 일상을</p>

				<div class="Landing__buttons" v-if="registerEnabled">
					<button class="Landing__button">가입</button>
					<button class="Landing__button">로그인</button>
				</div>
			</div>
		</header>

		<div class="Documents">
			<post-listing v-bind="posts"></post-listing>
		</div>
	</main>
</template>

<style lang="less" scoped>
	.Container {
		background: #161616;
		min-height: 100vh;
	}

	.Header {
		position: relative;
		height: 75vh;

		display: flex;
		align-items: center;
		justify-content: center;

		&__full {
			height: 100vh;
		}

		&__background {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;

			background-image: url('../assets/images/Background.jpg');
			background-size: cover;
			background-position: center;
			opacity: .3;
		}
	}

	.Landing {
		color: #fff;
		font-family: 'Noto Sans CJK KR', sans-serif;
		font-weight: 700;
		font-size: 2.4rem;
		position: relative;

		&__title {
			margin: 0;
		}

		&__description {
			margin: 0;
			margin-bottom: 50px;
		}

		&__button {
			display: block;
			background: #000;
			border: none;
			padding: 15px 50px;
			margin: 5px;

			color: #fff;
			font-family: 'Noto Sans CJK KR', sans-serif;
			font-size: 1.3rem;
			font-weight: 500;

			cursor: pointer;
			outline: none;
			transition: all .4s ease;

			&:hover {
				background: #039be5;
			}

			&:first-child {
				flex: 1;
			}
		}

		&__buttons {
			display: flex;
		}
	}
</style>

<script>
	import Navigation from "~/components/Navigation.vue";
	import PostListing from "~/components/PostListing.vue";

	export default {
		watchQuery: ['page'],

		computed: {
			siteName() {
				return this.$store.state.site.name;
			},

			siteDescription() {
				return this.$store.state.site.description;
			},

			registerEnabled() {
				return this.$store.state.site.registerEnabled;
			}
		},

		head() {
			return {
				title: this.siteName,
				meta: [
					{
						hid: 'description',
						name: 'description',
						content: this.siteDescription
					}
				]
			};
		},

		async asyncData({$axios, query}) {
			const params = query.page ? {page: query.page} : {};
			const posts = await $axios.$get('/api/post/', {params});

			return {posts};
		},

		components: {
			Navigation,
			PostListing
		}
	};
</script>
