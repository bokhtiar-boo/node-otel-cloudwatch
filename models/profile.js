const mongoose = require('mongoose');
const profileSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "'name' is required"],
		},
		description: String,
		mbti: String,
		enneagram: String,
		variant: String,
		tritype: Number,
		socionics: String,
		sloan: String,
		psyche: String,
		image: {
			type: String,
			default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFnGipem_n52os7UvEnwk5OWvFllpVVklwdg&usqp=CAU',
		},
	},
	{ timestamps: true }
);

const ProfileModel = mongoose.model('Profile', profileSchema);
module.exports = ProfileModel;
