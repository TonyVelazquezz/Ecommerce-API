const { body, validationResult } = require('express-validator');

// Utils
const { AppError } = require('../utils/appError');

// User routes validations
exports.createUserValidations = [
	body('name').isString().notEmpty().withMessage('Enter a valid name'),
	body('email').isEmail().notEmpty().withMessage('Enter a valid email'),
	body('password')
		.isAlphanumeric()
		.withMessage('Password must include letters and numbers')
		.isLength({ min: 6, max: 20 })
		.withMessage('Password must be at least 8 characters'),
];

exports.updateUserValidations = [
	body('name').notEmpty().withMessage('Name must not be empty'),
	body('email').isEmail().notEmpty().withMessage('Enter a valid email address'),
];

exports.loginUserValidations = [
	body('email').isEmail().notEmpty().withMessage('Credentials are not valid'),
	body('password').notEmpty().withMessage('Credentials are not valid'),
];
//End: User routes validations

// Product routes validationResult
exports.createProductValidations = [
	body('name').isString().notEmpty().withMessage('Enter a valid name'),
	body('description')
		.isString()
		.notEmpty()
		.withMessage('Enter a valid description'),
	body('price')
		.isDecimal()
		.custom(value => value > 0)
		.notEmpty()
		.withMessage('Enter a valid price'),
	body('quantity')
		.isInt()
		.custom(value => value > 0)
		.notEmpty()
		.withMessage('Enter a valid quantity'),
	body('category').isString().notEmpty().withMessage('Enter a valid category'),
];
//End: Product routes validations

// Order routes validation
exports.updateProductCartValidations = [
	body('newQuantity')
		.isInt()
		.custom(value => value >= 0)
		.withMessage('Enter a valid quantity'),
];

// End: Order routes validations

exports.validateResult = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const message = errors
			.array()
			.map(({ msg }) => msg)
			.join('. ');

		return next(new AppError(message, 400));
	}

	next();
};
