const nodemailer = require('nodemailer');
const pug = require('pug');
const path = require('path');
const { htmlToText } = require('html-to-text');

// Config
const {
	emailUser,
	emailPassword,
	emailFrom,
	environment,
	sendGridName,
	sendGridApiKey,
} = require('../config');

class Email {
	constructor(emails) {
		this.emails = emails;
	}

	createTransport() {
		if (environment === 'production') {
			return nodemailer.createTransport({
				service: 'SendGrid',
				auth: {
					user: sendGridName,
					pass: sendGridApiKey,
				},
			});
		}

		return nodemailer.createTransport({
			host: 'smtp.mailtrap.io',
			port: 2525,
			auth: {
				user: emailUser,
				pass: emailPassword,
			},
		});
	}

	async send(template, subject, templateOptions = {}) {
		const transport = await this.createTransport();

		const htmlPath = path.join(
			__dirname,
			'..',
			'views',
			'emails',
			`${template}.pug`
		);
		const html = pug.renderFile(htmlPath, templateOptions);

		const mailOptions = {
			subject,
			from: emailFrom,
			to: this.emails,
			html,
			text: htmlToText(html),
		};

		await transport.sendMail(mailOptions);
	}

	async sendWelcome(username, email) {
		await this.send('welcome', 'New account!', { username, email });
	}
}

module.exports = { Email };
