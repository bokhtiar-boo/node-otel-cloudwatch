const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log('Connected to MongoDB');
	} catch (error) {
		throw error;
	}
};

const disconnectDB = async () => {
	try {
		await mongoose.disconnect();
		console.log('Disconnected from MongoDB');
	} catch (error) {
		throw error;
	}
};

module.exports = {
	connectDB,
	disconnectDB,
};
