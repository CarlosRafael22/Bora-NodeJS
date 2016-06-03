var express = require('express');
//Import pra fazer as funcoes do mongoose no MongoDB
var mongoose = require('mongoose');
//Middleware pra poder serializar as respostas em JSON
var bodyParser = require('body-parser');
var moment = require('moment');

var Activities = require('../models/activity');
var Users = require('../models/user');

var activityRouter = express.Router();

activityRouter.route('/')
.get(function(req,res,next){
	Activities.find({}, function(err, activities){
		if(err) throw err;
		console.log(activities[0]);
		console.log(typeof(activities[0].updatedAt));		
		console.log(moment(activities[0].updatedAt).format('DD/MM/YYYY, HH:mm:ss'));

		//vai ser a nova lista com as activities.updatedAt certinho
		var new_activities = [];
		for(var i=0; i<activities.length; i++){
			console.log(activities[i].title);
			activities[i].updatedAt = moment(activities[i].updatedAt).format('DD/MM/YYYY, HH:mm:ss');
			new_activities.push(activities[i]);
		}
		console.log(activities[2].updatedAt);
		console.log(new_activities[2].updatedAt);
		res.json(200,{activities_returned: new_activities});
	});
})

//O author vai chegar como uma String com o valor do ObjectId
//ENtao vai ter que converter isso em ObjectId mesmo e dps salvar
// .post(function(req,res,next){
// 	Activities.create(req.body, function(err, activity){
// 		if(err) throw err;
// 		console.log('Activity created!');

// 		var id = activity._id;
// 		res.writeHead(200, {
// 			'Content-Type' : 'text/plain'
// 		});
// 		res.end('Added the activity with id: ' + id);
// 	});
// })
.post(function(req,res,next){

	var activity = {
		title: req.body.title,
		category: req.body.category,
		author: mongoose.Types.ObjectId(req.body.author)
	};

	console.log(activity.title);
	console.log(activity.author);
	console.log(typeof activity.title);
	console.log(typeof activity.author);
	Activities.create(activity, function(err, activity){
		if(err) throw err;
		console.log('Activity created!');

		var id = activity._id;
		res.writeHead(200, {
			'Content-Type' : 'text/plain'
		});

		var act_author = activity.author;
		//var author_name;
		console.log(typeof act_author);
		Users.findOne({_id: act_author}, function(err,user){
			if(err) throw err;
			console.log(user.name);
		});
		//Assim ta confirmado que ele salva a ObjectId e nao STring no activity.author
		res.end('Added the activity with id: ' + id);
	});
})

.delete(function(req,res,next){
	Activities.remove({}, function(err, resp){
		if(err) throw err;
		res.json(resp);
	});
});

activityRouter.route('/latestFrom/:last_datetime_synced')
.get(function(req,res,next){
	var last_date = new Date(req.params.last_datetime_synced);
	console.log(last_date.getTime());
	var now = new Date();
	console.log(now.getTime());
	var difference = moment(now).diff(moment(last_date));
	console.log(difference);
	// Activities.find({$where: function(last_date){
	// 	//var moment = require('moment');
	// 	//var last_date = new Date(req.params.last_datetime_synced);
	// 	console.log(last_date);
	// 	return (this.updatedAt - last_date > 0);
	// }}
	Activities.find({"updatedAt": {'$gte': last_date.getTime()}}
	, function(err, activities){
		if(err) throw err;
		console.log(activities[0]);
		console.log(moment(activities[0].updatedAt).format('DD/MM/YYYY, HH:mm:ss'));
		res.json(200,{activities_returned: activities});
	})
});

activityRouter.route('/:activityId')
.get(function(req,res,next){
	Activities.findById(req.params.activityId, function(err, activity){
		if(err) throw err;

		res.json(activity);
		console.log(res.body);
	});
})
.put(function(req,res,next){
	Activities.findByIdAndUpdate(req.params.activityId, 
		{$set: req.body}, {new:true}, function(err, activity){
			if(err) throw err;
			res.json(activity);
		});
})
.delete(function(req,res,next){
	//Activities.findByIdAndRemove(req.params.activityId, function(err, resp){
		console.log('chamei delete');
	Activities.remove({_id: req.params.activityId}, function(err, resp){
		if(err) throw err;
		console.log('Deletou saporra');
		res.json(resp);
	});
});


module.exports = activityRouter;

