var express = require('express');
var superagent = require('superagent');
var expect = require('expect');
var mongoose = require('mongoose');
var assert = require('assert');

var URL_ROOT = 'http://localhost:3000';

describe('Activity API', function(){
	var server;
	var Activity;

	before(function(){
		var app = express();
		mongoose.connect('mongodb://localhost:27017/boraDB');

		Activities = require('../models/activity');
		var activityRouter = require('../routes/activityRouter');
		
		app.use('/users', activityRouter);
		//server = app.listen(3000);
	});

	// after(function(){
	// 	server.close();
	// });

	beforeEach(function(done){
		Activities.remove({}, function(error){
			assert.ifError(error);
			console.log('Deletou');
			done();
		});
	});


	describe('Testando metodos de GET', function(){

		it('can load all activities', function(done){
		var activity1 = {
			title: 'Dando merda nessa porra',
			category: 'Music'
		};
		var activity2 = {
			title: 'Activity 2',
			category: 'Music'
		};
		var activity3 = {
			title: 'Activity 3',
			category: 'Dance'
		};

		var new_activities = [activity1, activity2, activity3];

		Activities.create(new_activities, function(err, activities_inserted){
			assert.ifError(err);

			var url = URL_ROOT + '/activities/';
			console.log('Activities created');

			superagent.get(url).end(function(err, res){
				//expect(err).to.equal(null);
				assert.ifError(err);
				console.log(res.body);
				done();
			});
		});

	});


	it('can load a activity by id', function(done){

		var activity_id = '000000000000000000000001';
		var activity = {
			_id: activity_id,
			title: 'Bora testar',
			category: 'Sports'
		};

		Activities.create(activity, function(err, activity){
			assert.ifError(err);

			var url = URL_ROOT + '/activities/' + activity_id;
			console.log('Activity created');

			superagent.get(url).end(function(err, res){
				//expect(err).toBe(null);
				assert.ifError(err);
				
				console.log('No get');

				console.log(res.body);
				assert.equal(res.body._id, activity_id);
				assert.equal(res.body.title, 'Bora testar');
				//expect(res.body._id).to.equal(activity_id);
				done();
			});
		});
	});


	});


	describe('Testando metodos de PUT', function(){

		it('can update an activity', function(done){

		var act_id = '000000000000000000000001';
		var activity  = {
			_id: act_id,
			title: 'Vai ser alterada',
			category: 'Entertainment'
		};

		Activities.create(activity, function(err, activity){
			assert.ifError(err);
			console.log('Criou activity');

			var url = URL_ROOT + '/activities/' + act_id;
			superagent.put(url)
			.send({title: 'Alterada mermao'})
			.end(function(err, res){
				assert.ifError(err);
				console.log(res.body);
				assert.equal(res.body.title, 'Alterada mermao');
				done();
			});
		});

		});
	});

	
	describe('Testando metodo POST', function(){

		it('Creating a new activity', function(done){

			var url = URL_ROOT + '/activities/';
			superagent.post(url)
			.send({
				title: 'Nova atividade',
				category: 'Sports'
			})
			.end(function(err, res){
				assert.ifError(err);
				
				Activities.findOne({title: 'Nova atividade'}, function(err, activity){
					assert.ifError(err);

					console.log(activity);
					assert.equal(activity.title, 'Nova atividade');
					assert.equal(activity.category, 'Sports');
					done();
				})
			});
		});
		
	});


	describe('Testando metodos DELETE', function(){

		//ID da activity criada no BeforeEach que vai ser usada pra deleta-la dps
		var poor_activity_id;

		beforeEach(function(done){

			//Criando aqui pq os dois its vao usar essa activity e deletar
			var poor_activity = {
				title: 'Activity soon to be deleted',
				category: 'Sorrow'
			};

			var poor_activity2 = {
				title: 'Activity bye bye',
				category: 'Sadness'
			};

			var poor_activities = [poor_activity, poor_activity2];

			Activities.create(poor_activities, function(err, del_activities){
				assert.ifError(err);
				console.log('Added activity to be deleted with ids : ' + 
					del_activities[0]._id + ' and ' + del_activities[1]._id);
				poor_activity_id = del_activities[0]._id;
				done();
			});
		});

		it('Deleting all the activities', function(done){

			var url = URL_ROOT + '/activities/';
			superagent.del(url).end(function(err, res){
				assert.ifError(err);
				console.log(res.body);
				done();
			});
		});


		it('Deleting especific activity by ID', function(done){

			//Criou fora e agora deleta
			console.log(poor_activity_id);
			var url = URL_ROOT + '/activities/' + poor_activity_id;
			superagent.del(url).end(function(err,res){
				assert.ifError(err);
				console.log(res.body);
				assert.deepEqual(res.body, { ok: 1, n: 1 });
				done();
			});
		});
	});
	

});