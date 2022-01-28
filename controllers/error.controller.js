// Config
const { environment } = require('../config');

//Utils
const { AppError } = require('../utils/appError');

const sendErrorDev = (err, req, res, next) => {
	return res.status(err.statusCode).json({
		error: err,
		status: err.status,
		message: err.message,
		stack: err.stack,
	});
};

const sendErrorProd = (err, req, res, next) => {
	return res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
	});
};

const handleDuplicateValues = () => {
	return new AppError('This email address already exists', 400);
};

const handleJWTInvalidSignature = () => {
	return new AppError('Please try login again', 401);
};

const handleJWTExpiration = () => {
	return new AppError('This session has expired, please try login again', 403);
};

const globalErrorHandler = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	// Validate environments
	if (environment === 'development') {
		sendErrorDev(err, req, res, next);
	} else if (environment === 'production') {
		let error = { ...err };

		//Catch known errors
		if (err.name === 'SequelizeUniqueConstraintError')
			error = handleDuplicateValues();
		if (err.name === 'JsonWebTokenError') error = handleJWTInvalidSignature();
		if (err.name === 'TokenExpiredError') error = handleJWTExpiration();

		sendErrorProd(error, req, res, next);
	}

	// environment === 'development' ? sendError() : sendErrorProd();
};

module.exports = { globalErrorHandler };
