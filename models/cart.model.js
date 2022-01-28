const { db, DataTypes } = require('../utils/database');

const Cart = db.define(
	'cart',
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
		status: {
			type: DataTypes.STRING(20),
			allowNull: false,
			//status: onGoing | deleted | cancelled | purchased
			defaultValue: 'onGoing',
		},
	},
	{ timestamps: false }
);

module.exports = { Cart };
