'use strict';

// tracer
const api = require('@opentelemetry/api');
const tracer = api.trace.getTracer('simple-express-mongo-app');

const express = require('express');
const cors = require('cors');
const profileRoutes = require('./routes/profileRoutes');

const app = express();
const port = process.env.PORT || 3000;

//Setup cors
app.use(cors());

// Middleware to parse JSON bodies, Considering JSON data will be sent in the request body.
app.use(express.json());

// Middleware to generate a span for each incoming request
app.use(async (req, res, next) => {
	const spanName = req.path;
	const common_span_attributes = {
		method: req.method,
		url: req.url,
		signal: 'trace',
		initTime: Date.now(),
	};

	const span = tracer.startSpan(spanName, {
		attributes: common_span_attributes,
	});

	// Set the created span as the active span in the context
	const ctx = api.trace.setSpan(api.context.active(), span);
	console.log(`Responding to ${spanName}`);

	res.on('finish', () => {
		span.setAttribute('finishTime', Date.now());
		span.end();
	});

	// Execute subsequent operations within the context of the span
	await api.context.with(ctx, async () => {
		await next();
	});
});

// Routes
app.use('/profile', profileRoutes());

// Utility function to block the event loop
const blockEventLoop = (duration) => {
	const start = Date.now();
	while (Date.now() - start < duration) {
		// This loop blocks the event loop
	}
};

// Route that blocks the event loop for 3 seconds
app.get('/block-3-seconds', (req, res) => {
	console.log('Blocking event loop for 3 seconds...');
	blockEventLoop(3000);
	res.send('Blocked event loop for 3 seconds');
});

// Route that blocks the event loop for 5 seconds
app.get('/block-5-seconds', (req, res) => {
	console.log('Blocking event loop for 5 seconds...');
	blockEventLoop(5000);
	res.send('Blocked event loop for 5 seconds');
});

// Route that blocks the event loop for 10 seconds
app.get('/block-10-seconds', (req, res) => {
	console.log('Blocking event loop for 10 seconds...');
	blockEventLoop(10000);
	res.send('Blocked event loop for 10 seconds');
});

// Middleware to handle requests for routes that are not available
app.use((req, res, next) => {
	res.status(404).json({ errors: ['Invalid route'] });
});

let server;

const startServer = async () => {
	try {
		server = app.listen(port, () => {
			console.log('Express server started. Listening on port', port);
		});
	} catch (error) {
		console.error('Error starting server:', error);
		process.exit(1);
	}
};

const stopServer = async () => {
	try {
		if (server) {
			server.close();
			console.log('Server stopped');
		}
	} catch (error) {
		console.error('Error stopping server:', error);
		process.exit(1);
	}
};

module.exports = { startServer, stopServer };
