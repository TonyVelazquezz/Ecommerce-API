const { Sequelize, DataTypes } = require('sequelize');
// Config
const { dbConfig, environment } = require('../config');

const db = new Sequelize({
	dialect: dbConfig.dialect,
	host: dbConfig.host,
	username: dbConfig.username,
	password: dbConfig.password,
	database: dbConfig.database,
	port: dbConfig.port,
	logging: false,
	dialectOptions:
		environment === 'production'
			? {
					ssl: {
						rejectUnauthorized: false,
					},
			  }
			: {},
});

module.exports = { db, DataTypes };
