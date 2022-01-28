const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Routers
const { userRouter } = require('./routes/users.routes');
const { productsRouter } = require('./routes/products.routes');
const { ordersRouter } = require('./routes/orders.routes');
const { viewsRouter } = require('./routes/views.routes');

// Controllers
const { globalErrorHandler } = require('./controllers/error.controller');

//Utils
const { AppError } = require('./utils/appError');

// Init app
const app = express();

app.use(xss());

app.use(
	rateLimit({
		windowMs: 60 * 1000,
		max: 100,
		standardHeaders: true,
		legacyHeaders: false,
		message: 'Too many requests from the server',
	})
);

app.set('view-engine', 'pug');
app.use(express.static(path.join(__dirname, 'views')));

app.use(express.urlencoded());
app.use(express.json());

app.use('*', cors());
app.use(cookieParser());

// Endpoints
app.use('/', viewsRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/sales', userRouter);
app.use('/api/v1/offers', userRouter);

app.use('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = { app };
