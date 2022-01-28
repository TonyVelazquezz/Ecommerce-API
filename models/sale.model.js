const { db, DataTypes } = require('../utils/database');

const Sale = db.define(
	'sales',
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
			//status: available | deleted
			defaultValue: 'available',
		},
	},
	{ timestamps: false }
);

module.exports = { Sale };
