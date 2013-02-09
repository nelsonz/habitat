<<<<<<< HEAD
/* Model Schemas for Mongoose */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/* START UTILITY FUNCTIONS */	
function toLower(str) {
	return str.toLowerCase();
}
/*END UTILITY FUNCTIONS */

/* START MODEL SCHEMAS */
exports.EventSchema = new Schema({
  start: Date,
  end: Date,
  name: String
});

=======
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
	
function toLower(str) {
	return str.toLowerCase();
}
	
>>>>>>> 289a296623ce7d8f436bec7c4b2c4e8bdf09d9d2
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
<<<<<<< HEAD
  event: String
=======
	booth: {type: Boolean, default: false},
>>>>>>> 289a296623ce7d8f436bec7c4b2c4e8bdf09d9d2
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
<<<<<<< HEAD
	},
});
/* END MODEL SCHEMAS */
=======
		booth: {type: Boolean, default: false},
	},
});
>>>>>>> 289a296623ce7d8f436bec7c4b2c4e8bdf09d9d2
