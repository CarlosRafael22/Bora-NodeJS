var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var activityComments = new Schema({
	comment: {
		type: String,
		required: true
	},
	author: {
		type: String,
		required: true
	}
},{
	timestamps: true
});


var activitySchema = new Schema({
	title: {
		type: String,
		required: true
	},
	category: {
		type: String,
		required: true
	},
	author: {
		type: Schema.ObjectId,
		required: true
	},
	date: {
		type: Date,
		required: false
	},
	place:{
		type: String,
		required: false
	},
	placeLatLng: {
		type: String,
		required: false
	},
	comments: [activityComments]
}, {
	timestamps: true
});

//creating the model
var Activities = mongoose.model('Activity', activitySchema);

module.exports = Activities;