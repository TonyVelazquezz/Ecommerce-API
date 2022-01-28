const { db, DataTypes } = require('../utils/database');

const Order = db.define(
	'orders',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		totalPrice: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
		},
		date: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		status: {
			type: DataTypes.STRING(20),
			allowNull: false,
			//status: active | deleted | cancelled | purchased
			defaultValue: 'active',
		},
	},
	{ timestamps: false }
);

module.exports = { Order };
