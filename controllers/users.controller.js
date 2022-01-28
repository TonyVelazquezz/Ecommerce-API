const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Config
const {
	jwtKey,
	jwtExpire,
	jwtCookieExpire,
	environment,
} = require('../config');

// Models
const { User } = require('../models/user.model');

// Utils
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const { Email } = require('../utils/email');

exports.loginUser = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	// If user already exists with email
	const user = await User.findOne({ where: { email } });
	// Compare passwords
	const isPasswordValid = await bcrypt.compare(password, user.password);

	if (!user || !isPasswordValid) {
		return next(new AppError('Credentials are not valid', 404));
	}

	//Generate JWT token
	const token = jwt.sign({ id: user.id }, jwtKey, {
		expiresIn: jwtExpire,
	});

	const cookieOptions = {
		httpOnly: true,
		expires: new Date(Date.now() + jwtCookieExpire * 60 * 60 * 1000),
	};

	res.cookie('jwt', token, cookieOptions);

	if (environment === 'production') cookieOptions.secure = true;

	res.status(200).json({
		status: 'success',
		token: token,
	});
});

exports.createUser = catchAsync(async (req, res, next) => {
	const { name, email, password, role } = req.body;

	const salt = await bcrypt.genSalt(12);
	const hashedPassword = await bcrypt.hash(password, salt);

	const newUser = await User.create({
		name,
		email,
		password: hashedPassword,
		role: role || 'standard',
	});

	// Remove password from response
	newUser.password = undefined;

	//Send welcome email to the user
	await new Email(newUser.email).sendWelcome(newUser.name, newUser.email);

	res.status(201).json({
		status: 'success',
		data: { user: newUser },
	});
});

exports.getUserById = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const user = await User.findOne({
		attributes: { exclude: ['password'] },
		where: { id },
	});

	if (!user) {
		return next(new AppError('User not found', 404));
	}

	res.status(200).json({
		status: 'success',
		data: {
			user,
		},
	});
});

exports.updateUser = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { name, email } = req.body;

	const user = await User.findOne({ where: { id } });

	if (!user) {
		return next(new AppError('User not found', 404));
	}

	await user.update({ name, email });

	res.status(204).json({ status: 'success' });
});

exports.disableUserAccount = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const user = await User.findOne({ where: { id } });

	if (!user) {
		return next(new AppError('User not found', 404));
	}

	await user.update({ status: 'disabled' });

	res.status(204).json({ status: 'success' });
});
