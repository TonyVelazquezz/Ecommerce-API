const express = require('express');

// Controllers
const {
	createProduct,
	getAllProducts,
	getProductDetails,
	updateProduct,
	disableProduct,
	getUserProducts,
} = require('../controllers/products.controller');

//Utils
const { multerUpload } = require('../utils/multer');

// Middlewares
const { protectSession, protectProductOwner } = require('../middlewares/auth.middleware');
const {
	createProductValidations,
	validateResult,
} = require('../middlewares/validators.middleware');

const router = express.Router();

router.use(protectSession);

// Get all products
// Create a new product
router
	.route('/')
	.get(getAllProducts)
	.post(
		multerUpload.fields([{ name: 'productImgs', maxCount: 6 }]),
		createProductValidations,
		validateResult,
		createProduct
	);

//Get all user products
router.get('/user-products', getUserProducts);

// Get products details
// Update product
// Remove product
router
	.route('/:id')
	.get(getProductDetails)
	.patch(protectProductOwner, updateProduct)
	.delete(protectProductOwner, disableProduct);

module.exports = { productsRouter: router };
