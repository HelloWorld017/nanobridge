<template>
	<nav class="Navigation" :class="{'Navigation--top': isTop, 'Navigation--connect': connectHeader}" role="navigation">
		<nuxt-link class="Navigation__brand NavButton" to="/">
			<nano-bridge class="Navigation__logo"></nano-bridge>
			<span class="Navigation__title">{{siteName}}</span>
		</nuxt-link>

		<div class="Navigation__auth"
			:class="{'Navigation__auth--opened': loginMenuOpened || userMenuOpened}"
			v-click-outside="hideMenu">

			<template v-if="authState">
				<a class="Navigation__auth__state NavButton" @click="toggleUserMenu">
					{{username}}
					<span class="Navigation__auth__loginName">
						(@{{loginName}})
					</span>
				</a>
			</template>
			<template v-else>
				<a class="Navigation__auth__state NavButton" @click="toggleLoginMenu">
					로그인
				</a>
			</template>

			<transition name="Fade">
				<form class="LoginMenu NavDialog"
					role="dialog"
					@submit.prevent="login"
					v-if="loginMenuOpened && !authState">

					<text-input class="LoginMenu__loginName" v-model="loginNameInput" placeholder="로그인 이름"/>
					<text-input class="LoginMenu__password" v-model="passwordInput"
						placeholder="비밀번호" type="password"/>

					<div class="LoginMenu__buttons">
						<router-link class="LoginMenu__button LoginMenu__button--flat" to="/register">
							회원가입 <i class="mdi mdi-arrow-left"></i>
						</router-link>

						<button class="LoginMenu__button"
							:class="{'LoginMenu__button--fail': failed}"
							@click.prevent="login">

							로그인 <i class="mdi mdi-arrow-right"></i>
						</button>
					</div>

					<transition name="Fade">
						<div class="LoginMenu__fail" v-if="failReason">
							{{failReason}}
						</div>
					</transition>
				</form>
			</transition>

			<transition name="Fade">
				<div class="UserMenu NavDialog" role="dialog" v-if="userMenuOpened && authState">
					<button class="UserMenu__button" @click="logout">
						<i class="mdi mdi-arrow-top-left"></i> 로그아웃
					</button>

					<nuxt-link class="UserMenu__button" to="/user">
						<i class="mdi mdi-arrow-right"></i> 프로필
					</nuxt-link>
				</div>
			</transition>
		</div>
	</nav>
</template>

<style lang="less" scoped>
	.Navigation {
		width: 100%;
		height: 80px;
		position: fixed;
		top: 0;
		left: 0;
		padding: 0 5vw;
		box-sizing: border-box;
		z-index: 20;

		display: flex;
		justify-content: space-between;
		align-items: stretch;

		background: rgba(#161616, .95);
		transition: all .4s ease;

		font-family: 'Titillium Web', 'Noto Sans CJK KR', sans-serif;
		font-size: 1.7rem;
		font-weight: 500;

		&--connect&--top {
			background: transparent;
		}

		&__brand {
			display: flex;
			align-items: center;

			color: #d0d0d0;
			text-decoration: none;

			transition: all .4s ease;

			&:hover {
				color: #fff;

				.NanoBridge__default {
					opacity: 0;
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

		&__auth {
			position: relative;
			display: flex;
			align-items: stretch;
			transition: all .4s ease;

			&--opened {
				background: rgba(0, 0, 0, .8);

				.NavButton::after {
					border-color: transparent;
				}
			}

			&__loginName {
				font-size: 1rem;
				font-weight: 400;
			}

			&__state {
				display: flex;
				align-items: center;

				cursor: pointer;
				color: #d0d0d0;
				font-size: 1.3rem;
				font-weight: 100;

				padding: 0 40px;

				&--unauthed {
					font-weight: 900;
				}
			}
		}
	}

	.NavButton {
		position: relative;

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
			&::after {
				transform: scaleX(1);
			}
		}
	}

	.NavDialog {
		position: absolute;
		top: 80px;
		right: 0;
		padding: 30px;
		background: rgba(0, 0, 0, .8);
	}

	.LoginMenu {
		&__loginName {
			margin-bottom: 10px;
		}

		&__buttons {
			text-align: right;
		}

		&__button {
			display: inline-block;
			padding: 10px 30px;
			margin-top: 20px;
			margin-left: auto;
			border: 1px solid #00bcd4;

			color: #d0d0d0;
			font-family: 'Noto Sans CJK KR', sans-serif;
			font-size: .9rem;
			font-weight: 500;
			text-decoration: none;

			cursor: pointer;
			background: transparent;
			transition: all .4s ease;
			outline: none;

			&:hover {
				background: #00bcd4;
				color: #202020;
			}

			&--fail {
				border-color: #f44336;
				animation-name: ShakeHard;
				animation-duration: 100ms;
				animation-timing-function: ease-in-out;
				animation-iteration-count: 8;

				&:hover {
					background: #f44336;
				}
			}

			&--flat {
				border: none;
				padding: 0;
				margin-right: 10px;

				&:hover {
					background: transparent;
					color: #00bcd4;
				}
			}
		}

		&__fail {
			margin-top: 5px;

			color: #f44336;
			font-family: 'Noto Sans CJK KR', sans-serif;
			font-weight: 700;
			font-size: .8rem;
		}
	}

	.UserMenu {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		min-width: 180px;

		background: transparent;
		padding: 0;

		&__button {
			display: flex;
			justify-content: flex-start;
			padding: 20px 50px;

			cursor: pointer;
			border: none;
			background: rgba(0, 0, 0, .8);
			outline: none;
			transition: all .4s ease;

			color: #d0d0d0;
			font-family: 'Noto Sans CJK KR', sans-serif;
			font-size: 1rem;
			font-weight: 700;
			text-decoration: none;

			&:hover {
				background: rgba(0, 151, 167, .8);
			}
		}
	}
</style>

<script>
	import ClickOutside from "vue-click-outside";
	import NanoBridge from "~/assets/images/NanoBridge.svg?inline";
	import TextInput from "~/components/TextInput.vue";

	import setDelay from "~/assets/js/setdelay";

	export default {
		data() {
			return {
				isTop: true,
				loginNameInput: '',
				passwordInput: '',
				loginMenuOpened: false,
				userMenuOpened: false,
				failReason: null,
				failed: false
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
			},

			authState() {
				return this.$store.getters['auth/authState'];
			},

			loginName() {
				return this.$store.state.auth.loginName;
			},

			username() {
				return this.$store.state.auth.username;
			}
		},

		methods: {
			toggleLoginMenu() {
				this.loginMenuOpened = !this.loginMenuOpened;
			},

			toggleUserMenu() {
				this.userMenuOpened = !this.userMenuOpened;
			},

			hideMenu() {
				this.loginMenuOpened = false;
				this.userMenuOpened = false;
			},

			async login() {
				try {
					await this.$store.dispatch('auth/login', {
						loginName: this.loginNameInput,
						password: this.passwordInput
					});
					this.hideMenu();
				} catch({message}) {
					this.failReason = message;
					this.failed = true;

					setDelay(() => this.failed = false, 1000, 'loginFail');
				}
			},

			async logout() {
				await this.$store.dispatch('auth/logout');
				this.hideMenu();
			}
		},

		components: {
			NanoBridge,
			TextInput
		},

		directives: {
			ClickOutside,
		},

		mounted() {
			this.isTop = window.scrollY === 0;

			document.addEventListener('scroll', ev => {
				this.isTop = window.scrollY === 0;
			});
		}
	};
</script>
