<template>
	<div class="TextInput" :class="{'TextInput--transcluent': transcluent, 'TextInput--failed': failed}">
		<input class="TextInput__input"
			v-model="_value"
			:type="type"
			:placeholder="placeholder"
			:spellcheck="correctFalse" :autocapitalize="correctOff"
			:autocorrect="correctOff" :autocomplete="correctOff"
			:maxlength="maxlen">

		<div class="TextInput__message InputDialog" v-if="message || (failed && failMessage)">
			<i class="InputDialog__icon mdi mdi-alert-box-outline"></i>

			<span class="InputDialog__content">
				{{failMessage || message}}
			</span>
		</div>
		<slot></slot>
	</div>
</template>

<style lang="less" scoped>
	.TextInput {
		display: flex;
		flex-direction: column;

		position: relative;
		border-radius: 500px;
		width: 250px;

		&__input {
			border-radius: 500px;
			box-sizing: border-box;

			background: #212121;
			margin: 0;
			padding: 10px 30px;
			border: 1px solid transparent;

			color: #d0d0d0;
			font-family: 'Noto Sans CJK KR', sans-serif;
			font-size: .9rem;
			text-align: center;

			outline: none;
			transition: all .4s ease;

			&::placeholder {
				color: #808080;
			}

			&::selection {
				background: rgba(33, 33, 33, .7);
				color: #d0d0d0;
			}

			&:focus {
				background: #d0d0d0;
				color: #202020;
			}
		}

		&--transcluent {
			.TextInput__input {
				background: rgba(33, 33, 33, .3);

				&:focus {
					background: #202020;
					border: 1px solid #202020;
					color: #d0d0d0;
				}

				&::selection {
					background: rgba(0, 188, 212, .5);
				}
			}
		}

		&--failed {
			.TextInput__input {
				&:not(:focus) {
					border: 1px solid #f44336;
					background: #f44336 !important;
				}

				&:focus {
					color: #f44336;
				}
			}
		}
	}

	.InputDialog {
		position: absolute;
		top: 50%;
		right: -330px;
		width: 300px;
		background: rgba(0, 0, 0, .3);

		display: flex;
		align-items: center;

		transform: translate(0, -50%);

		&__icon {
			color: #e57373;
			font-size: 1.2rem;
			padding: 0 10px;
		}

		&__content {
			display: inline-block;
			flex: 1;
			width: 100%;
			padding: 5px 0;
			padding-right: 10px;

			color: #d0d0d0;
			font-family: 'Noto Sans CJK KR', sans-serif;
			font-size: .75rem;
			font-weight: 500;
		}

		&::after {
			content: '';
			display: inline-block;

			position: absolute;
			left: -10px;
			width: 0;
			height: 0;

			border-style: solid;
			border-width: 10px 10px 10px 0;
			border-color: transparent rgba(0, 0, 0, .3) transparent transparent;
		}
	}
</style>

<script>
	export default {
		model: {
			prop: 'value',
			event: 'change'
		},

		props: {
			type: {
				type: String,
				default: 'text'
			},
			message: {
				type: String,
				default: ''
			},
			failMessage: {
				type: String,
				default: ''
			},
			value: String,
			placeholder: String,
			correct: Boolean,
			failed: Boolean,
			transcluent: Boolean,
			maxlen: Number
		},

		computed: {
			_value: {
				get() {
					return this.value;
				},

				set(v) {
					this.$emit('change', v);
				}
			},

			correctOff() {
				return this.correct ? 'on' : 'off';
			},

			correctFalse() {
				return this.correct.toString();
			}
		},

		methods: {
			shake() {

			}
		}
	};
</script>
