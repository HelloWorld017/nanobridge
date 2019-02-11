<template>
	<div class="PaginationTrigger" ref="trigger">
		<a class="PaginationTrigger__interaction" v-if="next" @click="preload()">
			<i class="PaginationTrigger__icon mdi mdi-arrow-down"></i>
			<span>더 읽기</span>
		</a>
	</div>
</template>

<style lang="less" scoped>
	.PaginationTrigger {
		display: flex;
		align-items: center;
		justify-content: center;

		&__interaction {
			display: flex;
			align-items: center;
			justify-content: center;

			height: 2.2rem;
			border-radius: 1.1rem;
			padding: 0 1.1rem;
			padding-right: 1.42rem;

			color: #00acc1;
			font-size: .8rem;
			font-family: 'Noto Sans CJK KR', sans-serif;
			font-weight: 700;
			text-decoration: none;

			cursor: pointer;
			transition: all .4s ease;

			&:hover {
				background: #252525;
				color: #d0d0d0;
			}
		}

		&__icon {
			height: 2.2rem;
			margin-right: 5px;

			font-size: 1.2rem;
			text-align: center;
			line-height: 2.2rem;

			border-radius: 50%;
		}
	}
</style>

<script>
	export default {
		data() {
			return {
				observer: null,
				loadRequestFinished: false,
				loadFulfilled: false
			};
		},

		props: {
			next: Boolean,

			loadNext: {
				type: Function,
				required: true
			}
		},

		methods: {
			async preload(entries) {
				if(!this.loadRequestFinished) return;
				if(!this.next) {
					console.log("Preload Cancelled");
					this.loadFulfilled = true;
					return;
				}

				if(typeof entries !== 'undefined') {
					if(entries.length < 1) return;
					if(!entries[0].isIntersecting) {
						this.loadFulfilled = true;
						return;
					} else {
						this.loadFulfilled = false;
					}
				}

				this.loadRequestFinished = false;
				await this.loadNext();
				this.loadRequestFinished = true;
				setTimeout(() => {
					if(!this.loadFulfilled) {
						this.preload();
					}
				}, 1000);
			},

			refresh() {
				this.preload();
			}
		},

		mounted() {
			this.observer = new IntersectionObserver(this.preload, {
				root: null,
				rootMargin: '250px 0px',
				threshold: 0
			});
			this.observer.observe(this.$refs.trigger);
			this.loadRequestFinished = true;
			this.preload();
		}
	};
</script>
