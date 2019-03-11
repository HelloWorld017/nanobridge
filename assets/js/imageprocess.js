class ProcessedImage {
	constructor(blob) {
		this._url = null;
		this.blob = blob;
		this.key = Math.random().toString(36).slice(2);
	}

	get url() {
		if(this._url) {
			return this._url;
		}

		this._url = URL.createObjectURL(this.blob);
		return this._url;
	}

	revoke() {
		if(this._url) URL.revokeObjectURL(this._url);
	}
}

export default async blobs => {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	const results = [];
	let failed = 0;

	for(let blob of blobs) {
		const imageUrl = URL.createObjectURL(blob);
		try {
			const image = await new Promise((resolve, reject) => {
				const blobImage = new Image();
				blobImage.onload = () => resolve(blobImage);
				blobImage.onerror = () => reject();
				blobImage.src = imageUrl;
			});

			canvas.width = image.naturalWidth;
			canvas.height = image.naturalHeight;
			ctx.drawImage(image, 0, 0);

			const resultBlob = await new Promise(resolve => canvas.toBlob(resolve));
			results.push(resultBlob);

			URL.revokeObjectURL(imageUrl);
		} catch(e) {
			failed++;
			continue;
		}
	}

	return {
		results: results.map(result => {
			return new ProcessedImage(result);
		}),
		failed
	};
};
