// Model
const { Product } = require('../models/product.model');
const { ProductImgs } = require('../models/productImgs.model');
const { User } = require('../models/user.model');

// Utils
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const { filterObject } = require('../utils/filterObject');
const { firebaseStorage, ref, uploadBytes } = require('../utils/firebase');

exports.getAllProducts = catchAsync(async (req, res, next) => {
	const products = await Product.findAll({
		where: { status: 'active' },
		include: [{ model: User, attributes: { exclude: 'password' } }],
	});

	res.status(200).json({ status: 'success', data: { products } });
});

exports.getProductDetails = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const product = await Product.findOne({
		where: { id },
		include: [{ model: User, attributes: { exclude: 'password' } }, { model: ProductImgs }],
	});

	if (!product) return next(new AppError('Product not found'), 404);

	res.status(200).json({ status: 'success', data: { product } });
});

exports.createProduct = catchAsync(async (req, res, next) => {
	const { name, description, category, quantity, price } = req.body;
	const { currentUser } = req;

	const newProduct = await Product.create({
		name,
		description,
		category,
		quantity,
		price,
		userId: currentUser.id,
	});

	// Save imgs path
	const imgsPromises = req.files.productImgs.map(async img => {
		const imgName = `/img/products/${newProduct.id}-${currentUser.id}-${img.originalname}`;
		const imgRef = ref(firebaseStorage, imgName);

		const result = await uploadBytes(imgRef, img.buffer);

		await ProductImgs.create({
			productId: newProduct.id,
			imgPath: result.metadata.fullPath,
		});
	});

	await Promise.all(imgsPromises);

	res.status(201).json({ status: 'success', data: {} });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
	const { currentProduct } = req;

	const filteredObject = filterObject(
		req.body,
		'name',
		'description',
		'price',
		'quantity',
		'category'
	);

	if (filteredObject.quantity && filteredObject <= 0) {
		return next(new AppError('Invalid product quantity', 400));
	}

	await currentProduct.update({
		...filteredObject,
	});

	res.status(204).json({ status: 'success' });
});

exports.disableProduct = catchAsync(async (req, res, next) => {
	const { currentProduct } = req;

	await currentProduct.update({ status: 'deleted' });

	res.status(204).json({ status: 'success' });
});

exports.getUserProducts = catchAsync(async (req, res, next) => {
	const { currentUser } = req;

	const products = await Product.findAll({
		where: { userId: currentUser.id },
	});

	res.status(200).json({ status: 'success', data: { products } });
});
