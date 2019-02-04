<template>
	<nav class="Navigation" :class="{'Navigation--top': isTop, 'Navigation--connect': connectHeader}">
		<nuxt-link class="Navigation__link" to="/">
			<nano-bridge class="Navigation__logo"></nano-bridge>
			<span class="Navigation__brand">{{siteName}}</span>
		</nuxt-link>
	</nav>
</template>

<style lang="less" scoped>
	.Navigation {
		width: 100%;
		height: 80px;
		position: fixed;
		top: 0;
		left: 0;
		padding: 0 32px;
		box-sizing: border-box;
		z-index: 1;

		display: flex;
		align-items: center;

		background: #161616;
		transition: all .4s ease;
		//box-shadow: 0 2px 4px 1px rgba(0, 0, 0, .3);

		font-family: 'Titillium Web', sans-serif;
		font-size: 1.7rem;
		font-weight: 500;

		&--connect&--top {
			background: transparent;
		}

		&__link {
			position: relative;

			display: flex;
			align-items: center;

			color: #d0d0d0;
			text-decoration: none;

			transition: all .4s ease;

			&::after {
				content: '';

				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				width: 100%;

				border-bottom: 3px solid rgba(255, 255, 255, .2);
				transition: all .4s ease;
				transform: scaleX(0);
			}

			&:hover {
				color: #fff;

				.NanoBridge__default {
					opacity: 0;
				}

				&::after {
					transform: scaleX(1);
				}
			}
		}

		&__logo {
			width: 80px;
			height: 80px;
			margin-right: 10px;
			* {
				transition: all .4s ease;
			}
		}
	}
</style>

<script>
	import NanoBridge from "~/assets/images/NanoBridge.svg?inline";

	export default {
		data() {
			return {
				isTop: true
			};
		},

		props: {
			connectHeader: Boolean
		},

		computed: {
			siteName() {
				return this.$store.state.site.name;
			},

			siteDescription() {
				return this.$store.state.site.description;
			}
		},

		components: {
			NanoBridge
		},

		mounted() {
			this.isTop = window.scrollY === 0;

			document.addEventListener('scroll', ev => {
				this.isTop = window.scrollY === 0;
			});
		}
	};
</script>
