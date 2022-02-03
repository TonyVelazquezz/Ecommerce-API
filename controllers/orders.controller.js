//Models
const { Cart } = require('../models/cart.model');
const { Product } = require('../models/product.model');
const { ProductInCart } = require('../models/productInCart.model');
const { Order } = require('../models/order.model');
const { ProductInOrder } = require('../models/productInOrder.mode');

// Utils
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const { filterObject } = require('../utils/filterObject');
const { formatUserCart } = require('../utils/queryFormat');
const { Email } = require('../utils/email');

exports.getUserCart = catchAsync(async (req, res, next) => {
	const { currentUser } = req;

	const cart = await Cart.findOne({
		where: { userId: currentUser.id, status: 'onGoing' },
		attributes: { exclude: ['userId', 'status'] },
		include: [
			{
				model: ProductInCart,
				attributes: { exclude: ['cartId', 'status'] },
				where: { status: 'active' },
				include: [
					{
						model: Product,
						attributes: {
							exclude: ['id', 'userId', 'price', 'quantity', 'status'],
						},
					},
				],
			},
		],
	});

	if (!cart) return next(new AppError('Cart not found'), 404);

	const formattedCart = formatUserCart(cart);

	res.status(200).json({ status: 'success', cart: formattedCart });
});

exports.addProductToCart = catchAsync(async (req, res, next) => {
	const { product } = req.body;
	const { currentUser } = req;

	const filteredObject = filterObject(product, 'id', 'quantity');

	// validate if quantity is less or equal to existing quantity
	const productExists = await Product.findOne({
		where: { id: filteredObject.id, status: 'active' },
	});

	if (!productExists || filteredObject.quantity > productExists.quantity) {
		return next(new AppError(`Product doesn't exists or is less than quantity`, 400));
	}

	// Validate if current user already has a shopping cart
	const cart = await Cart.findOne({
		where: { userId: currentUser.id, status: 'onGoing' },
	});

	// If cart doesn't exist, create a new cart
	if (!cart) {
		const totalPrice = +filteredObject.quantity * +productExists.price;

		const newCart = await Cart.create({ userId: currentUser.id, totalPrice });

		await ProductInCart.create({
			cartId: newCart.id,
			productId: filteredObject.id,
			quantity: filteredObject.quantity,
			price: productExists.price,
		});
	}

	// Update cart
	if (cart) {
		// Check if product already exists on the cart
		const productInCartExists = await ProductInCart.findOne({
			where: { cartId: cart.id, productId: filteredObject.id, status: 'active' },
		});

		if (productInCartExists) {
			return next(new AppError('You already added this product to the cart', 400));
		}

		// Add product to cart
		await ProductInCart.create({
			cartId: cart.id,
			productId: filteredObject.id,
			quantity: filteredObject.quantity,
			price: productExists.price,
		});

		// Calculate the cart total price
		const updatedTotalPrice =
			+cart.totalPrice + +filteredObject.quantity * +productExists.price;

		await cart.update({ totalPrice: updatedTotalPrice });
	}

	res.status(201).json({ status: 'success' });
});

exports.updateProductCart = catchAsync(async (req, res, next) => {
	const { currentUser } = req;
	const { productId, newQuantity } = req.body;

	// Find user's cart
	const userCart = await Cart.findOne({
		where: { userId: currentUser.id, status: 'onGoing' },
	});

	if (!userCart) {
		return next(new AppError('Invalid cart', 400));
	}

	// Find product in cart
	const productInCart = await ProductInCart.findOne({
		where: {
			productId,
			cartId: userCart.id,
			status: 'active',
		},
		include: [{ model: Product }],
	});

	if (!productInCart) {
		return next(new AppError('Invalid product', 400));
	}

	if (newQuantity > +productInCart.product.quantity) {
		return next(
			new AppError(`This product only has ${productInCart.product.quantity} items`, 400)
		);
	}

	if (newQuantity === productInCart.quantity) {
		return next(new AppError('You already have that quantity in that product', 400));
	}

	let updatedTotalPrice;

	// Check if user added or removed from the selected product
	// If user send 0 quantity to product, remove it from the cart
	if (newQuantity === 0) {
		updatedTotalPrice =
			+userCart.totalPrice - +productInCart.quantity * +productInCart.price;

		// Update quantity to product in cart
		await productInCart.update({ quantity: 0, status: 'removed' });
	} else if (newQuantity > +productInCart.quantity) {
		// New items were added
		updatedTotalPrice =
			+userCart.totalPrice + (newQuantity - +productInCart.quantity) * +productInCart.price;

		// Update quantity to product in cart
		await productInCart.update({ quantity: newQuantity });
	} else if (newQuantity < +productInCart.quantity) {
		// Items were removed from the cart
		updatedTotalPrice =
			+userCart.totalPrice - (+productInCart.quantity - newQuantity) * +productInCart.price;

		// Update quantity to product in cart
		await productInCart.update({ quantity: newQuantity });
	}

	// Calculate new total price
	await userCart.update({ totalPrice: updatedTotalPrice });

	res.status(204).json({ status: 'success' });
});

exports.purchaseOrder = catchAsync(async (req, res, next) => {
	const { currentUser } = req;

	// Get user's cart and get the products of the cart
	const cart = await Cart.findOne({
		where: { userId: currentUser.id, status: 'onGoing' },
		include: [
			{
				model: ProductInCart,
				attributes: { exclude: ['cartId'] },
				where: { status: 'active' },
				include: [{ model: Product }],
			},
		],
	});

	if (!cart) return next(new AppError(`You don't have a cart`));

	// Set Cart status to 'purchased'
	await cart.update({ status: 'purchased' });

	// Create a new order
	const { userId, totalPrice, productsInCarts } = cart;

	// current date
	const currentDate = Date.now();
	const today = new Date(currentDate).toDateString();

	const newOrder = await Order.create({
		userId,
		totalPrice,
		date: today,
	});

	// Loop through the products array, for each product
	const promises = productsInCarts.map(async productInCart => {
		// Set productInCart status to 'purchased'
		await productInCart.update({ status: 'purchased' });

		// Look for the Product(productId)
		const product = await Product.findOne({
			where: { id: productInCart.productId },
		});

		// Subtract and update the quantity
		const newQuantity = product.quantity - productInCart.quantity;
		await product.update({ quantity: newQuantity });

		// Create productInOrder with orderId, productId, qty and price
		const { productId, price, quantity } = productInCart;

		await ProductInOrder.create({
			orderId: newOrder.id,
			productId,
			price,
			quantity,
		});
	});

	await Promise.all(promises);

	const productsInOrder = await ProductInOrder.findAll({
		where: { orderId: newOrder.id, status: 'available' },
		include: [{ model: Product }],
	});

	// Send email to customer for success purchase
	await new Email(currentUser.email).sendPurchaseSuccess(
		currentUser.name,
		productsInOrder,
		newOrder.totalPrice
	);

	res.status(200).json({ status: 'success', productsInOrder });
});

exports.getUserOrders = catchAsync(async (req, res, next) => {
	const { currentUser } = req;

	const orders = await Order.findAll({
		where: { userId: currentUser.id, status: 'active' },
		attributes: { exclude: ['status'] },
		include: [
			{
				model: ProductInOrder,
				attributes: { exclude: ['productId', 'orderId', 'status'] },
				where: { status: 'available' },
				include: [
					{
						model: Product,
						attributes: { exclude: ['price', 'userId', 'status', 'quantity'] },
					},
				],
			},
		],
	});

	if (!orders) return next(new AppError('orders not found', 404));

	res.status(200).json({ status: 'success', orders });
});

exports.getOrderById = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const order = await Order.findOne({
		where: { id, status: 'active' },
		attributes: { exclude: ['status'] },
		include: [
			{
				model: ProductInOrder,
				attributes: { exclude: ['productId', 'orderId', 'status'] },
				where: { status: 'available' },
				include: [
					{
						model: Product,
						attributes: { exclude: ['price', 'userId', 'status', 'quantity'] },
					},
				],
			},
		],
	});

	if (!order) return next(new AppError('This order is not available', 404));

	res.status(200).json({ status: 'success', order });
});
