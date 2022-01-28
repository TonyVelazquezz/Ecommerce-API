// Models
const { Cart } = require('../models/cart.model');
const { Order } = require('../models/order.model');
const { Product } = require('../models/product.model');
const { ProductInCart } = require('../models/productInCart.model');
const { ProductSold } = require('../models/productSold.model');
const { ProductInOrder } = require('../models/productInOrder.mode');
const { ProductImgs } = require('../models/productImgs.model');
const { Sale } = require('../models/sale.model');
const { User } = require('../models/user.model');

const userRelations = () => {
	// 1 User <--> Product M
	User.hasMany(Product);
	Product.belongsTo(User);

	// 1 User <--> Sale M
	User.hasMany(Sale);
	Sale.belongsTo(User);

	// 1 User <--> Cart 1
	User.hasOne(Cart);
	Cart.belongsTo(User);

	// 1 User <--> Order M
	User.hasMany(Order);
	Order.belongsTo(User);
};

const productRelations = () => {
	// 1 Product <--> ProductImgs M
	Product.hasMany(ProductImgs);
	ProductImgs.belongsTo(Product);

	// 1 Product <--> ProductInOrder M
	Product.hasOne(ProductInOrder);
	ProductInOrder.belongsTo(Product);

	// 1 Product <--> ProductInCart 1
	Product.hasOne(ProductInCart);
	ProductInCart.belongsTo(Product);

	//1 Product <--> ProductSold 1
	Product.hasOne(ProductSold);
	ProductSold.belongsTo(Product);
};

const orderRelations = () => {
	// 1 Order <--> ProductInOrder M
	Order.hasMany(ProductInOrder, { foreignKey: 'orderId', sourceKey: 'id' });
	ProductInOrder.belongsTo(Order, { targetKey: 'id' });
};

const cartRelations = () => {
	// 1 Cart <--> ProductInCart M
	Cart.hasMany(ProductInCart);
	ProductInCart.belongsTo(Cart);
};

const saleRelations = () => {
	//1 Sale <--> ProductSold M
	Sale.hasMany(ProductSold);
	ProductSold.belongsTo(Sale);
};

const initModels = () => {
	userRelations();
	productRelations();
	orderRelations();
	cartRelations();
	saleRelations();
};

module.exports = { initModels };
