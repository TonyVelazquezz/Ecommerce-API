const express = require('express');

// Controllers
const {
	getUserCart,
	addProductToCart,
	updateProductCart,
	purchaseOrder,
} = require('../controllers/orders.controller');

// Middlewares
const { protectSession } = require('../middlewares/auth.middleware');
const {
	validateResult,
	updateProductCartValidations,
} = require('../middlewares/validators.middleware');

const router = express.Router();

router.use(protectSession);

//Get User cart
router.get('/get-cart', getUserCart);

// Add product to cart
router.post('/add-product-to-cart', addProductToCart);

// Update product quantity
router.patch(
	'/update-product-cart',
	updateProductCartValidations,
	validateResult,
	updateProductCart
);

// Remove product from cart

// Create order
router.post('/purchase-order', purchaseOrder);

// Get users orders

module.exports = { ordersRouter: router };
