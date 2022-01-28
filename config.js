const { config } = require('dotenv');
config();

module.exports = {
	dbConfig: {
		dialect: process.env.DB_DIALECT,
		host: process.env.DB_HOST,
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
		port: process.env.DB_PORT,
	},
	port: process.env.PORT,
	environment: process.env.NODE_ENV,
	jwtKey: process.env.JWT_KEY,
	jwtExpire: process.env.JWT_EXPIRE,
	jwtCookieExpire: process.env.JWT_COOKIE_EXPIRE,
	emailFrom: process.env.EMAIL_FROM,
	emailUser: process.env.EMAIL_USER,
	emailPassword: process.env.EMAIL_PASSWORD,
	sendGridName: process.env.SENDGRID_NAME,
	sendGridApiKey: process.env.SENDGRID_API_KEY,
};
