// Config
const { port } = require('./config');
// Utils
const { db } = require('./utils/database');
const { initModels } = require('./utils/initModels');

// Express app
const { app } = require('./app');

// Model relations
initModels();

db
	.sync()
	.then(() => {
		console.log('Database connected');
		startServer();
	})
	.catch(err => console.log(err));

const startServer = () => {
	const PORT = port || 4000;

	app.listen(PORT, () => {
		console.log(`e-commerce API running on port ${PORT}!`);
	});
};
