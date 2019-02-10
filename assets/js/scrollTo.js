// Custom implementation of scrollTo because it has a bug

class Scroller {
	constructor(y) {
		this.leftTick = 30;
		this.target = y;

		window.scroll(0, 0);
	}

	scroll() {
		this.leftTick--;
		if(this.leftTick <= 0) return;

		const height = this.scrollTop;
		const newScroll = window.pageYOffset + (this.target - window.pageYOffset) / this.leftTick;

		window.scroll(0, newScroll);

		setTimeout(() => this.scroll(), 15);
	}
}

export default y => {
	new Scroller(y).scroll();
};
