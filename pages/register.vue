<template>
	<main class="Main">
		<navigation connect-header></navigation>

		<form class="Register" submit.prevent="submit">
			<text-input v-model="loginNameInput" placeholder="아이디"
				fail-message="아이디는 대소문자, 숫자, 하이픈(-), 밑줄(_), 온점(.)으로만 구성돼야 합니다."
				:maxlen="32" :failed="!isValidLoginName" transcluent/>

			<text-input v-model="usernameInput" placeholder="유저명" :maxlen="32" transcluent/>
			<text-input v-model="emailInput" type="email" placeholder="이메일"
				fail-message="이메일에는 @이 포함되어 있어야 합니다." :failed="!isValidEmail" transcluent/>

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

			<button class="Button" :class="{'Button--hidden': !readyToSubmit}">
				<i class="mdi mdi-arrow-right"></i> 회원가입
			</button>
		</form>

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

		& > .TextInput:not(:first-child) {
			margin-top: 10px;
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
</style>

<script>
	import Navigation from "~/components/Navigation.vue";
	import TextInput from "~/components/TextInput.vue";

	import strength from "~/assets/js/strength";

	export default {
		data() {
			return {
				loginNameInput: '',
				usernameInput: '',
				emailInput: '',
				passwordInput: '',
				passwordVerify: '',
				loginNameExists: false,
				emailExists: false
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
				return this.loginNameInput === '' || /^[a-zA-Z0-9-_.]+$/.test(this.loginNameInput);
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
			}
		},

		watch: {
			loginNameInput() {
				//TODO check duplicate
			},

			emailInput() {

			}
		},

		components: {
			Navigation,
			TextInput
		}
	}
</script>
