const { initializeOpenTelemetry } = require('./lib/opentelemetry');
require('dotenv').config();

initializeOpenTelemetry().then(async () => {
	const { startServer } = require('./server');
	const { connectDB } = require('./lib/db');
	await startServer();
	await connectDB();
});
