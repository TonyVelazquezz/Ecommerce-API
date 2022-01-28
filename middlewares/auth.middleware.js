const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

require('crypto').randomBytes(64).toString('hex');

// Config
const { jwtKey } = require('../config');

// Models
const { User } = require('../models/user.model');
const { Product } = require('../models/product.model');

// Utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

exports.protectSession = catchAsync(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}

	if (!token) return next(new AppError('Invalid session', 401));

	// Validate token
	const decoded = jwt.verify(token, jwtKey);

	const user = await User.findOne({
		attributes: { exclude: 'password' },
		where: { id: decoded.id, status: 'available' },
	});

	if (!user) return next(new AppError('user not available', 401));

	// Add data to request object
	req.currentUser = user;

	next();
});

exports.protectProductOwner = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { currentUser } = req;

	// SELECT * FROM products WHERE status = 'active' OR status = 'soldOut'
	const product = await Product.findOne({
		where: { id, status: { [Op.or]: ['active', 'soldOut'] } },
	});

	if (!product) return next(new AppError('Product not found', 404));

	if (product.userId !== currentUser.id) {
		return next(new AppError(`You don't own this product`, 401));
	}

	req.currentProduct = product;

	next();
});

exports.protectUserOwner = catchAsync(async (req, res, next) => {
	const { id, name } = req.params;
	const { currentUser } = req;

	if (+id !== +currentUser.id) {
		return next(
			new AppError(`You are not the owner of this account: ${name}`, 404)
		);
	}

	next();
});
