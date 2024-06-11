'use strict';

const process = require('process');
const axios = require('axios');
const opentelemetry = require('@opentelemetry/sdk-node');
const { AWSXRayPropagator } = require('@opentelemetry/propagator-aws-xray');
const { AwsInstrumentation } = require('@opentelemetry/instrumentation-aws-sdk');
const { MongooseInstrumentation } = require('@opentelemetry/instrumentation-mongoose');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { BatchSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { AWSXRayIdGenerator } = require('@opentelemetry/id-generator-aws-xray');

const getResource = async () => {
	let _instanceId;
	try {
		const response = await axios.get('http://169.254.169.254/latest/meta-data/instance-id', {
			timeout: 2000,
		});
		_instanceId = response.data;
	} catch (error) {
		console.error('Error retrieving instance ID:', error.message);
	}
	return Resource.default().merge(
		new Resource({
			[SemanticResourceAttributes.SERVICE_NAME]: 'simple-express-mongo-app',
			[SemanticResourceAttributes.SERVICE_INSTANCE_ID]: _instanceId || 'localhost',
		})
	);
};

const _traceExporter = new ConsoleSpanExporter();
const _spanProcessor = new BatchSpanProcessor(_traceExporter);

const _tracerConfig = {
	idGenerator: new AWSXRayIdGenerator(),
};

const initializeOpenTelemetry = async () => {
	const _resource = await getResource();
	const sdk = new opentelemetry.NodeSDK({
		textMapPropagator: new AWSXRayPropagator(),
		instrumentations: [
			new MongooseInstrumentation({ suppressInternalInstrumentation: true }),
			new AwsInstrumentation({
				suppressInternalInstrumentation: true,
			}),
		],
		resource: _resource,
		spanProcessor: _spanProcessor,
		traceExporter: _traceExporter,
	});
	sdk.configureTracerProvider(_tracerConfig, _spanProcessor);

	// this enables the API to record telemetry
	await sdk.start();

	const { disconnectDB } = require('./db');
	const { stopServer } = require('../server');

	// gracefully shut down the SDK on process exit
	process.on('SIGTERM', async () => {
		await disconnectDB();
		await stopServer();
		sdk
			.shutdown()
			.then(() => console.log('Tracing and Metrics terminated'))
			.catch((error) => console.log('Error terminating tracing and metrics', error))
			.finally(() => process.exit(0));
	});
};

module.exports = { initializeOpenTelemetry };