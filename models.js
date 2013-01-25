var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
	
function toLower(str) {
	return str.toLowerCase();
}
	
exports.HackSchema = new Schema({
	title: {type: String, required: true},
	owners: [Schema.ObjectId],
	team: [String],
	source: String,
	demo: String,
	video: String,
	picture: String,
	blurb: {type: String, required: true},
	tags: [String],
	hackid: String,
	booth: {type: Boolean, default: false},
});

exports.UserSchema = new Schema({
	github: {
		id: String,
		username: String,
		name: String,
		email: {type: String, set: toLower, lowercase: true},
		url: String,
		avatarUrl: String,
	},
	info: {
		name: String,
		organization: String,
		position: String,
		site: String,
		blurb: String,
		attending: {type: Boolean, default: true},
		booth: {type: Boolean, default: false},
	},
});
