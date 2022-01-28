const { db, DataTypes } = require('../utils/database');

const ProductImgs = db.define(
	'productImgs',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		productId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		imgPath: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		status: {
			type: DataTypes.STRING(20),
			allowNull: false,
			//status: active | deleted | unavailable
			defaultValue: 'active',
		},
	},
	{ timestamps: false }
);

module.exports = { ProductImgs };
