<template>
	<div class="ListingSplit">
		<div class="ListingSplit__wrapper Container">
			<nuxt-link class="ListingSplit__text"
				:to="link"
				@click.native="navigate">

				다음 페이지에서 보기
				<i class="mdi mdi-arrow-right"></i>
			</nuxt-link>
		</div>

		<div class="ListingSplit__indicator">
			{{page}} / {{max}}
		</div>
	</div>
</template>

<style lang="less" scoped>
	.ListingSplit {
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
</style>

<script>
	export default {
		props: {
			page: {
				type: Number,
				required: true
			},

			max: {
				type: Number,
				required: true
			},

			link: {
				type: String,
				required: true
			}
		},

		methods: {
			navigate() {
				this.$emit('navigate');
			}
		}
	};
</script>
