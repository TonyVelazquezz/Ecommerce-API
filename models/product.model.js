const { db, DataTypes } = require('../utils/database');

const Product = db.define(
	'products',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		description: {
			type: DataTypes.STRING(510),
			allowNull: false,
			unique: true,
		},
		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		price: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
		},
		category: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		status: {
			type: DataTypes.STRING(100),
			allowNull: false,
			//status: active | deleted | soldOut
			defaultValue: 'active',
		},
	},
	{ timestamps: false }
);

Product.addHook('afterUpdate', async (product, options) => {
	if (product.status === 'soldOut' && product.quantity > 0)
		await product.update({ status: 'active' });
	if (product.quantity <= 0) await product.update({ status: 'soldOut' });
});

module.exports = { Product };
