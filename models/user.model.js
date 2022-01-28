const { db, DataTypes } = require('../utils/database');

const User = db.define(
	'users',
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
		email: {
			type: DataTypes.STRING(100),
			allowNull: false,
			unique: true,
		},
		password: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
		role: {
			type: DataTypes.STRING(20),
			allowNull: false,
			//role: standard | admin
			defaultValue: 'standard',
		},
		status: {
			type: DataTypes.STRING(20),
			allowNull: false,
			//status: available | disabled
			defaultValue: 'available',
		},
	},
	{ timestamps: false }
);

module.exports = { User };
