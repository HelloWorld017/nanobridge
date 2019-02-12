<template>
	<main class="Main">
		<navigation connect-header></navigation>
		<header class="Header">
			<img class="Header__background" :src="user.background" :alt="user.username">
			<div class="Header__gradient"></div>
		</header>

		<div class="Columns">
			<div class="User">
				<div class="User__wrapper">
					<img class="User__profile" :src="user.profile" :alt="user.username">

					<div class="User__info">
						<h1 class="User__username">
							{{user.username}} <span class="User__loginname">(@{{user.loginName}})</span>
						</h1>

						<div class="User__bio" v-if="bio">
							{{bio}}
						</div>
					</div>
				</div>
			</div>
			<div class="Documents">
				<post-listing
					ref="listing"
					v-bind="posts"
					:context="`/user/${user.loginName}`"
					:api-context="`/api/post/written-by/${user.loginName}`"
					:own-list="loginName === user.loginName">
				</post-listing>
			</div>
		</div>
	</main>
</template>

<style lang="less" scoped>
	.Header {
		position: relative;
		height: 35vh;

		display: flex;
		align-items: center;
		justify-content: center;

		&__full {
			height: 100vh;
		}

		&__background, &__gradient {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}

		&__background {
			object-fit: cover;
			object-position: center;
			opacity: .6;
		}

		&__gradient {
			background: linear-gradient(to bottom, rgba(20, 20, 20, .6), transparent 30%);
		}
	}

	.Columns {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.User {
		background: #202020;

		&__wrapper {
			max-width: 768px;
			width: 95vw;
			margin: 0 auto;

			display: flex;
			align-items: center;
			min-height: 64px;
		}

		&__profile {
			position: relative;
			width: 100px;
			height: 100px;
			margin-top: -55px;
			z-index: 2;

			border-radius: 50%;
			border: 5px solid #202020;
		}

		&__username {
			color: #d0d0d0;
			font-family: 'Titillium Web', 'Noto Sans CJK KR', sans-serif;
			font-size: 1.75rem;
			font-weight: 100;

			margin: 0;
			margin-left: 20px;
		}

		&__loginname {
			color: #808080;
			font-weight: 400;
			font-size: 1.3rem;
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

			bio() {
				if(!this.user.descriptions) return null;

				const bioObj = this.user.descriptions.find(v => v.key === 'bio');
				return bioObj ? bioObj.value : null;
			},

			loginName() {
				return this.$store.state.auth.loginName;
			}
		},

		head() {
			return {
				title: `${this.user.username} - ${this.siteName}`,
				meta: [
					{
						hid: 'description',
						name: 'description',
						content: this.bio || this.siteDescription
					}
				]
			};
		},

		async asyncData({$axios, query, params, error}) {
			const {user} = params;
			const userData = await $axios.$get(`/api/user/${user}`);

			if(!userData.ok) {
				error({statusCode: 404, message: "유저가 존재하지 않습니다."});
				return;
			}

			const reqParams = query.page ? {page: query.page} : {};
			const posts = await $axios.$get(`/api/post/written-by/${user}`, {params: reqParams});

			return {posts, user: userData.user};
		},

		watch: {
			'$route.query.page'() {
				this.$nextTick(() => {
					this.$refs.listing.refresh();
				});
			}
		},

		components: {
			Navigation,
			PostListing
		}
	};
</script>
