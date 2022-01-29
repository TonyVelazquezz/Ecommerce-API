const multer = require('multer');
const path = require('path');
const { AppError } = require('./appError');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const desPath = path.join(__dirname, '..', 'imgs');

		cb(null, desPath);
	},
	filename: (req, file, cb) => {
		const [filename, extension] = file.originalname.split('.');

		const newFilename = `${filename}-${Date.now()}.${extension}`;

		cb(null, newFilename);
	},
});

const fileFilter = (req, file, cb) => {
	if (!file.mimetype.startsWith('image')) {
		return cb(new AppError('This file is not a valid image', 400));
	}

	cb(null, true);
};

const multerUpload = multer({ storage, fileFilter });

module.exports = { multerUpload };
