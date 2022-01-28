const { Op } = require('sequelize');

//Model
const { Product } = require('../models/product.model');
const { User } = require('../models/user.model');

// Utils
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const { filterObject } = require('../utils/filterObject');

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
		include: [{ model: User, attributes: { exclude: 'password' } }],
	});

	if (!product) return next(new AppError('Product not found'), 404);

	res.status(200).json({ status: 'success', data: { product } });
});

exports.createProduct = catchAsync(async (req, res, next) => {
	const { name, description, category, quantity, price } = req.body;

	const userId = req.currentUser.id;

	const newProduct = await Product.create({
		name,
		description,
		category,
		quantity,
		price,
		userId,
	});

	res.status(201).json({ status: 'success', data: { newProduct } });
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
