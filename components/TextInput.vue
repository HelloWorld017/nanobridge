<template>
	<div class="TextInput">
		<input class="TextInput__input Input"
			v-model="_value"
			:type="text"
			:placeholder="placeholder"
			:spellcheck="correctFalse" :autocapitalize="correctOff"
			:autocorrect="correctOff" :autocomplete="correctOff"
			:maxlength="maxlen">

		<slot></slot>
	</div>
</template>

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
			value: String,
			placeholder: String,
			correct: Boolean,
			maxlen: {
				type: Number
			}
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
	}
</script>
