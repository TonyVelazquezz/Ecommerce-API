const { Sequelize, DataTypes } = require('sequelize');
// Config
const { dbConfig } = require('../config');

const db = new Sequelize({
	dialect: dbConfig.dialect,
	host: dbConfig.host,
	username: dbConfig.username,
	password: dbConfig.password,
	database: dbConfig.database,
	port: dbConfig.port,
	logging: false,
});

module.exports = { db, DataTypes };
