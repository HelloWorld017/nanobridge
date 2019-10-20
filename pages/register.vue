<template>
	<main class="Main">
		<navigation connect-header></navigation>

		<form class="Register" @submit.prevent="submit" v-if="!authState">
			<h1 class="Register__title">회원가입</h1>
			<text-input v-model="loginNameInput" placeholder="아이디"
				@change="checkLoginName"
				:fail-message="loginNameExists ? '동일한 아이디가 존재합니다.' :
					'아이디는 대소문자, 숫자로만 구성된 5글자 이상의 문자열이어야 합니다.'"
				:maxlen="32" :failed="!isValidLoginName" transcluent/>

			<text-input v-model="usernameInput" placeholder="유저명" :maxlen="32" transcluent/>
			<text-input v-model="emailInput" type="email" placeholder="이메일"
				@change="checkEmail"
				:fail-message="emailExists ? '동일한 이메일이 존재합니다.' : '이메일에는 @이 포함되어 있어야 합니다.'"
				:failed="!isValidEmail" transcluent/>

			<text-input v-model="passwordInput" type="password" placeholder="비밀번호" :maxlen="128"
				:failed="!isValidPassword" :fail-message="strength.failedReason" transcluent>

				<div class="PasswordMeter" :style="{
						transform: `scaleX(${strength.percentage})`,
						background: `${strength.color}`
					}">
				</div>
			</text-input>

			<text-input v-model="passwordVerify" type="password" placeholder="비밀번호 확인"
				fail-message="비밀번호와 같지 않습니다." :failed="!isPasswordVerified" transcluent/>

			<text-input v-if="!registerEnabled" v-model="keyInput" placeholder="가입 키" transcluent/>

			<button class="Button" :class="{'Button--hidden': !readyToSubmit, 'Button--fail': failed}">
				<i class="mdi mdi-arrow-right"></i> 회원가입
			</button>

			<transition name="Fade">
				<div class="Register__fail" v-if="failReason">
					{{failReason}}
				</div>
			</transition>
		</form>
		<div class="Register" v-else>
			<div class="LoggedIn">
				이제 <nuxt-link to="/"><i class="mdi mdi-arrow-left"></i>돌아가셔도</nuxt-link> 괜찮습니다.
			</div>
		</div>

		<div class="Main__background">
		</div>
	</main>
</template>

<style lang="less" scoped>
	.Main {
		display: flex;
		flex-direction: column;
		height: 100%;

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

	.Register {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		padding-top: 80px;
		position: relative;
		z-index: 3;

		& > .TextInput {
			margin-bottom: 10px;
		}

		&__title {
			color: #d0d0d0;
			font-family: 'Noto Sans CJK KR', sans-serif;
			font-weight: 100;
		}
	}

	.PasswordMeter {
		position: absolute;
		bottom: 0;
		width: 100%;
		height: 5px;
		opacity: 0;

		transition: all .4s ease;
		transform-origin: center center;

		input:focus ~ & {
			opacity: 1;
		}
	}

	.Button {
		position: relative;
		margin-top: 10px;
		padding: 10px;
		width: 250px;

		background: transparent;
		border: 1px solid #00bcd4;
		outline: none;
		cursor: pointer;
		transition: all .4s ease;

		color: #d0d0d0;
		font-family: 'Noto Sans CJK KR', sans-serif;
		font-size: .8rem;
		font-weight: 500;

		&--hidden {
			border: 1px solid #808080;
			cursor: not-allowed;
			color: #808080;
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

		&:not(&--hidden):hover {
			background: #00bcd4;
			color: #202020;
		}
	}

	.LoggedIn {
		color: #d0d0d0;
		font-family: 'Noto Sans CJK KR', sans-serif;
		font-size: 3rem;
		font-weight: 100;

		& > a {
			color: #00acc1;
			font-weight: 600;
			text-decoration: none;
			position: relative;

			&::after {
				content: '';
				display: block;

				position: absolute;
				left: 0;
				right: 0;
				bottom: -3px;
				height: 3px;
				background: #00acc1;

				transition: all .4s ease;
				transform: scaleX(0);
			}

			&:hover::after {
				transform: scaleX(1);
			}
		}
	}
</style>

<script>
	import Navigation from "~/components/Navigation.vue";
	import TextInput from "~/components/TextInput.vue";

	import setDelay from "~/assets/js/setdelay";
	import strength from "~/assets/js/strength";

	export default {
		data() {
			return {
				loginNameInput: '',
				usernameInput: '',
				emailInput: '',
				passwordInput: '',
				passwordVerify: '',
				keyInput: '',
				loginNameExists: false,
				emailExists: false,
				failReason: '',
				failed: false
			};
		},

		computed: {
			isPasswordVerified() {
				return this.passwordVerify === '' || this.passwordInput === this.passwordVerify;
			},

			isValidEmail() {
				return this.emailInput === '' || (this.emailInput.includes('@') && !this.emailExists);
			},

			isValidLoginName() {
				return this.loginNameInput === '' || (
					/^[a-zA-Z0-9]{5,32}$/.test(this.loginNameInput) && !this.loginNameExists
				);
			},

			isValidPassword() {
				return this.passwordInput === '' || this.strength.passed;
			},

			strength() {
				return strength(this.passwordInput);
			},

			readyToSubmit() {
				return this.loginNameInput && this.usernameInput && this.emailInput &&
					this.passwordInput && this.passwordVerify && this.isValidEmail &&
					this.isValidLoginName && this.isValidPassword && this.isPasswordVerified;
			},

			authState() {
				return this.$store.getters['auth/authState'];
			},

			registerEnabled() {
				return this.$store.state.site.registerEnabled;
			}
		},

		methods: {
			async submit() {
				const result = await this.$request('/api/user/', 'post', {
					loginName: this.loginNameInput,
					email: this.emailInput,
					username: this.usernameInput,
					password: this.passwordInput,
					key: this.keyInput
				});

				if(!result.ok) {
					let reason = '회원가입에 실패했습니다. :(';

					switch(result.reason) {
						case 'wrong-createtoken':
							reason = '잘못된 가입 키를 입력했습니다. 설정파일을 참고해주세요.';
							break;

						case 'wrong-arguments':
							reason = '잘못된 입력값을 받았습니다.';
							break;

						case 'user-already-exists':
							reason = '유저가 이미 존재합니다.';
							break;
					}

					this.failReason = reason;
					this.failed = true;

					setDelay(() => this.failed = false, 1000, 'registerFail');
					return;
				}

				this.$router.push('/');
			},

			async checkEmail() {
				const {exists} = await this.$request(
					`/api/user/$exists?email=${encodeURIComponent(this.emailInput)}`
				);

				this.emailExists = exists;
			},

			async checkLoginName() {
				const {exists} = await this.$request(
					`/api/user/$exists?loginName=${encodeURIComponent(this.loginNameInput)}`
				);

				this.loginNameExists = exists;
			}
		},

		components: {
			Navigation,
			TextInput
		}
	}
</script>
