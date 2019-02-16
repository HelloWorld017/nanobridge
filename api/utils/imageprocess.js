const fs = require('fs');
const {promisify} = require('util');
const Jimp = require('jimp');

const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const ImageProcess = {
	async processImage(file, options) {
		const descriptor = await promisify(fs.open)(file.path, 'r');

		const buffer = Buffer.alloc(png.length);
		await promisify(fs.read)(descriptor, buffer, 0, png.length, 0);
		await promisify(fs.close)(descriptor);

		if(buffer.compare(png) !== 0) throw new Error('Is not a PNG');

		const drawingImage = await Jimp.read(file.path);
		const drawingWidth = drawingImage.bitmap.width;
		const drawingHeight = drawingImage.bitmap.height;
		let targetWidth = drawingWidth;
		let targetHeight = drawingHeight;

		if(drawingWidth === 0 || drawingHeight === 0) throw new Error('Invalid size!');

		if(options.resize) {
			if(options.targetSize) {
				targetWidth = options.targetSize.width;
				targetHeight = options.targetSize.height;
			}

			if(options.maxSize) {
				const maxWidth = options.maxSize.width;
				const maxHeight = options.maxSize.height;

				const needsResize = targetWidth > maxWidth || targetHeight > maxHeight;

				if(needsResize) {
					const targetRatio = targetWidth / targetHeight;
					const maxRatio = maxWidth / maxHeight;

					if(targetRatio > maxRatio) {
						targetWidth = maxWidth;
						targetHeight = Math.floor(maxWidth / targetRatio);
					} else {
						targetWidth = Math.floor(maxHeight * targetRatio);
						targetHeight = maxHeight;
					}
				}
			}
		}

		if(drawingWidth !== targetWidth || drawingHeight !== targetHeight) {
			drawingImage.cover(targetWidth, targetHeight, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_CENTER);
		}

		const newImage = await new Promise((resolve, reject) => {
			new Jimp(targetWidth, targetHeight, 'rgba(255, 255, 255, 0)', (err, image) => {
				if(err) return reject(err);
				resolve(image);
			});
		});
		newImage.blit(drawingImage, 0, 0);

		return newImage;
	},

	async all(files, options, renameFn) {
		const processedImages = [];
		const failedImages = [];
		let index = 0;

		for(let [fileIndex, file] of files.entries()) {
			try {
				const image = await ImageProcess.processImage(file, options);
				const fileName = renameFn(index);
				await image.writeAsync(fileName);

				processedImages.push(fileName);
				index++;
			} catch(e) {
				failedImages.push(fileIndex);
			}

			await promisify(fs.unlink)(file.path);
		}

		return {
			processed: processedImages,
			failed: failedImages
		};
	},

	async one(file, options, target) {
		let result = true;

		try {
			const image = await ImageProcess.processImage(file, options);
			await image.writeAsync(target);
		} catch(e) {
			result = false;
		}

		await promisify(fs.unlink)(file.path);
		return result;
	}
};

module.exports = ImageProcess;
