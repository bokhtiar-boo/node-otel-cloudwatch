const ProfileModel = require('../models/profile');

const getProfile = async (req, res) => {
	try {
		const _id = req.params._id;
		if (!_id) {
			return res.status(400).json({ errors: ['Profile ID is required'] });
		}

		const profile = await ProfileModel.findById(_id).lean();
		if (!profile) {
			return res.status(404).json({ errors: ['Profile not found'] });
		}

		res.status(200).json({ profile });
	} catch (error) {
		res.status(500).json({ errors: [`Error fetching profile: ${error.message}`] });
	}
};

const createProfile = async (req, res) => {
	try {
		const newProfile = new ProfileModel(req.body);
		await newProfile.save();
		const { __v, createdAt, updatedAt, ...profile } = newProfile.toObject();
		res.status(201).json({ message: 'Profile creation successful', profile });
	} catch (error) {
		if (error.name === 'ValidationError') {
			const validationErrors = Object.values(error.errors).map((error) => error.message);
			res.status(400).json({ errors: validationErrors });
		} else {
			res.status(500).json({ errors: [`Error creating profile: ${error.message}`] });
		}
	}
};

const updateProfile = async (req, res) => {
	try {
		const _id = req.params._id;
		const name = req.body.name;
		if (!_id || !name) {
			return res.status(400).json({ errors: ['Profile ID/Name is required'] });
		}

		const profile = await ProfileModel.findById(_id);
		if (!profile) {
			return res.status(404).json({ errors: ['Profile not found'] });
		}
		profile.name = name;
		await profile.save();
		const { __v, createdAt, updatedAt, ...rest } = profile.toObject();
		res.status(201).json({ message: 'Profile creation successful', profile: rest });
	} catch (error) {
		if (error.name === 'ValidationError') {
			const validationErrors = Object.values(error.errors).map((error) => error.message);
			res.status(400).json({ errors: validationErrors });
		} else {
			res.status(500).json({ errors: [`Error creating profile: ${error.message}`] });
		}
	}
};

module.exports = { getProfile, createProfile, updateProfile };
