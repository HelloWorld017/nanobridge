<template>
	<main class="Container">
		<navigation connect-header></navigation>
		<header class="Header">
			<img class="Header__background" :src="user.background" :alt="user.username">
		</header>

		<div class="Columns">
			<div class="User">
				<img class="User__profile" :src="user.profile" :alt="user.username">

				<div class="User__info">
					<h1 class="User__username">
						{{user.username}} <span class="User__loginname">(@{{user.loginName}})</span>
					</h1>
				</div>
			</div>
			<div class="Documents">
				<post-listing ref="listing" v-bind="posts"></post-listing>
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

		&__background {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;

			object-fit: cover;
			object-position: center;
			opacity: .3;
		}
	}

	.Columns {
		display: flex;
		justify-content: center;
	}

	.User {
		flex: 1;

		&__profile {
			width: 196px;
			height: 196px;
			margin-top: -98px;
			border-radius: 50%;
		}
	}

	.Documents {
		flex: 3;
	}

	@media (max-width: 768px) {
		.Columns {

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
				return this.user.descriptions.find(v => v.key === 'bio').value;
			}
		},

		head() {
			return {
				title: `${this.user.username} - ${this.siteName}`,
				meta: [
					{
						hid: 'description',
						name: 'description',
						content: this.siteDescription
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
