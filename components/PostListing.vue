<template>
	<div class="PostListing">
		<template v-if="hasPerm">
			<div class="PostListing__narrow PostListing__header">
				<div class="PostListing__chooser Chooser">
					<button class="Chooser__item" :class="{'Chooser__chosen': chosen === 1}" @click="choose(1)">
						글
					</button>

					<button class="Chooser__item" :class="{'Chooser__chosen': chosen === 2}" @click="choose(2)">
						앨범
					</button>

					<div class="Chooser__highlight"></div>
				</div>

				<div class="PostListing__pagination Pagination" v-if="isPageMode">
					<template v-for="(x, i) in paginationItems">
						<span class="Pagination__page Pagination__page--disabled"
							:key="`pagination-${i}`"
							v-if="x === null">

							<i class="mdi mdi-dots-horizontal"></i>
						</span>

						<nuxt-link class="Pagination__page"
							:to="getPageLink(x)"
							:key="`pagination-${i}`"
							v-else>

							{{x}}
						</nuxt-link>
					</template>
				</div>
			</div>

			<div class="PostListing__list">
				<template v-for="(post, index) in postsAppend">
					<div class="PostListing__wrapper PostListing__narrow">
						<post :key="`${post.postId}-post`" :post="post" :user="usersAppend[post.author]"></post>
					</div>

					<template v-if="isLastOfPage(index)">
						<div class="PostListing__split">
							<div class="PostListing__split__wrapper PostListing__narrow">
								<nuxt-link class="PostListing__split__text"
									:to="getPageLink(getPageByIndex(index + 1))"
									@click.native="scrollTop">

									다음 페이지에서 보기
									<i class="mdi mdi-arrow-right"></i>
								</nuxt-link>
							</div>

							<div class="PostListing__split__indicator">
								{{getPageByIndex(index)}} / {{paginationAppend.max}}
							</div>
						</div>
					</template>
				</template>

				<pagination-trigger
					ref="trigger"
					:next="paginationAppend.current < paginationAppend.max"
					:load-next="loadNext">
				</pagination-trigger>
			</div>
		</template>
		<template v-else>
			<div class="PostListing__noperm PostListing__narrow">
				<i class="PostListing__noperm__icon mdi mdi-alert-outline"></i>
				<div class="PostListing__noperm__text">
					글들을 보시려면 로그인 / 회원가입을 해주세요!
				</div>
			</div>
		</template>
	</div>
</template>

<style lang="less" scoped>
	.PostListing {
		padding: 50px 0;

		&__header {
			display: flex;
			justify-content: space-between;
		}

		&__chooser {
			width: 200px;
			height: 32px;
			border-radius: 16px;

			background: #202020;
		}

		&__narrow {
			max-width: 768px;
			width: 95%;

			margin: 0 auto;
		}

		&__noperm {
			background: #202020;
			padding: 80px 0;
			color: #909090;
			text-align: center;
			font-family: 'Noto Sans CJK KR', sans-serif;
			font-size: 1.5rem;
			font-weight: 700;

			&__icon {
				color: #0097a7;
				font-size: 5rem;
			}
		}

		&__split {
			font-family: 'Noto Sans CJK KR', sans-serif;
			font-size: 0.8rem;
			font-weight: 700;

			border-top: 3px dashed #212121;
			height: 20px;
			position: relative;

			&__wrapper {
				display: flex;
				justify-content: flex-end;
				line-height: 1.2rem;
				transform: translate(0, -0.6rem);
			}

			&__text {
				color: #d0d0d0;
				text-decoration: none;

				background: #161616;
				padding: 0 10px;
				transition: all .4s ease;

				&:hover {
					color: #00bcd4;
				}
			}

			&__indicator {
				position: absolute;
				right: 50px;
				top: -7rem;
				line-height: 6.2rem;
				font-size: 5rem;
				font-weight: 100;
				font-family: "Noto Sans CJK KR", sans-serif;
				color: #2a2a2a;
			}
		}

		&__list {
			display: flex;
			flex-direction: column;
			align-items: stretch;
		}

		&__wrapper {
			display: flex;

			& > * {
				flex: 1;
			}
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

	.Pagination {
		display: flex;

		&__page {
			text-align: center;
			line-height: 32px;

			width: 32px;
			height: 32px;
			background: #202020;

			color: #d0d0d0;
			border-radius: 50%;
			transition: all .4s ease;

			font-family: 'Titillium Web', sans-serif;
			font-size: .8rem;
			font-weight: 700;
			text-decoration: none;

			&:not(:last-child) {
				margin-right: 10px;
			}

			&.nuxt-link-exact-active {
				background: #d0d0d0;
				color: #202020;
			}
		}
	}

	@media (max-width: 1280px) {
		.PostListing__split__indicator {
			display: none;
		}
	}
</style>

<script>
	import PaginationTrigger from "./PaginationTrigger.vue";
	import Post from "./Post.vue";

	export default {
		data() {
			return {
				chosen: 1,
				additionalPosts: [],
				additionalUsers: {},
				updatedPagination: null,
				scrollWhenPageChange: false
			};
		},

		props: {
			context: {
				type: String,
				default: '/'
			},

			apiContext: {
				type: String,
				default: '/api/post'
			},

			posts: {
				type: Array,
				default: []
			},

			users: {
				type: Object,
				default: {}
			},

			pagination: {
				type: Object,
				default: {
					current: 1,
					max: 1,
					perPage: 25
				}
			}
		},

		computed: {
			hasPerm() {
				return this.$store.state.auth.acl.includes('postRead');
			},

			isPageMode() {
				return !!this.$route.query.page;
			},

			usersAppend() {
				return Object.assign({}, this.users, this.additionalUsers);
			},

			postsAppend() {
				return this.posts.concat(this.additionalPosts);
			},

			paginationAppend() {
				return this.updatedPagination || this.pagination;
			},

			paginationItems() {
				let items = [];

				const min = 1;
				const current = this.paginationAppend.current;
				const max = this.paginationAppend.max;

				if(current - 3 > min + 1) {
					items.push(min, null);
				}

				for(let i = Math.max(min, current - 2); i <= Math.min(current + 2, max); i++) {
					items.push(i);
				}

				if(current + 2 < max - 1) {
					items.push(null, max);
				}

				return items;
			}
		},

		methods: {
			choose(i) {
				this.chosen = i;
			},

			getPageByIndex(index) {
				return Math.floor(index / this.paginationAppend.perPage) + this.pagination.current;
			},

			getPageLink(page) {
				return `${this.context}?page=${page}`;
			},

			isLastOfPage(index) {
				return (index + 1) % this.paginationAppend.perPage === 0 &&
					index !== 0 &&
					this.getPageByIndex(index) !== this.paginationAppend.max;
			},

			async loadNext() {
				const newPage = await this.$axios.$get(`${this.apiContext}?page=${this.paginationAppend.current + 1}`);

				this.additionalPosts.push(...newPage.posts);
				this.additionalUsers = Object.assign({}, this.additionalUsers, newPage.users);
				this.updatedPagination = newPage.pagination;
			},

			refresh() {
				this.additionalPosts = [];
				this.updatedPagination = null;

				this.$nextTick(() => {
					this.$refs.trigger.refresh();
				});
			},

			scrollTop() {
				this.scrollWhenPageChange = true;
			}
		},

		watch: {
			'$route.query.page'() {
				if(this.scrollWhenPageChange) {
					this.$nextTick(() => {
						const top = window.innerHeight * 0.6;
						try {
							window.scrollTo({
								top,
								left: 0,
								behavior: 'smooth'
							});
						} catch(e) {
							window.scrollTo(top, 0);
						}
					});

					this.scrollWhenPageChange = false;
				}
			}
		},

		components: {
			PaginationTrigger,
			Post
		}
	}
</script>
