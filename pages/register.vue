<template>
	<main class="Main">
		<navigation connect-header></navigation>

		<form class="Register" submit.prevent="submit">
			<input class="Register__loginName Input"
				:class="{'Input--failed': !isValidLoginName}"
				type="text"
				v-model="loginNameInput"
				placeholder="아이디"
				spellcheck="false" autocapitalize="off"
				autocorrect="off" autocomplete="off"
				maxlength="32">

			<input class="Register__loginName Input"
				type="text"
				v-model="usernameInput"
				placeholder="유저명"
				spellcheck="false" autocapitalize="off"
				autocorrect="off" autocomplete="off"
				maxlength="32">

			<input class="Register__email Input"
				:class="{'Input--failed': !isValidEmail}"
				type="email"
				v-model="emailInput"
				placeholder="이메일">

			<input class="Register__password Input"
				type="password"
				v-model="passwordInput"
				placeholder="비밀번호"
				maxlength="128">

			<div class="PasswordMeter">
				<div class="PasswordMeter__meter" :style="{
						transform: `scaleX(${strength.percentage})`,
						background: `${strength.color}`
					}">
				</div>
			</div>

			<input class="Register__passwordVerify Input"
				:class="{'Input--failed': !isPasswordVerified}"
				type="password"
				v-model="passwordVerify"
				placeholder="비밀번호 확인">
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

		& > input:not(:first-child) {
			margin-top: 10px;
		}
	}

	.Input {
		border: 1px solid transparent;
		background: rgba(33, 33, 33, .3);

		&:focus {
			border: 1px solid #d0d0d0;
			color: #d0d0d0;
		}

		&--failed {
			border: 1px solid #f44336;

			&:focus {
				background: #f44336;
				border: 1px solid #f44336;
			}
		}

		&::selection {
			background: rgba(33, 33, 33, .7);
			color: #d0d0d0;
		}
	}
</style>

<script>
	import Navigation from "~/components/Navigation.vue";
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

			strength() {
				return strength(this.passwordInput);
			}
		},

		watch: {
			loginNameInput() {

			},

			emailInput() {

			}
		},

		components: {
			Navigation
		}
	}
</script>
