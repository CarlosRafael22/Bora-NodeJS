var superagent = require('superagent');
var mongoose = require('mongoose');
var assert = require('assert');
var express = require('express');

var URL_ROOT = 'http://localhost:3000';

describe('User API testing', function(){

	var Users = require('../models/user');

	before(function(){
		var app = express();
		mongoose.connect('mongodb://localhost:27017/boraDB');

		Users = require('../models/user');
		var userRouter = require('../routes/users');
		
		app.use('/users', userRouter);

	});

	beforeEach(function(done){
		//Remove all the users
		Users.remove({}, function(err){
			assert.ifError(err);
			console.log('Users removidos');
			done();
		});
	});

	describe('Testando metodos GET', function(){

		var some_user_id;
		beforeEach(function(done){

			//Adicionando users pra fazer os GETS
			var user1 = {
				username: 'Mama',
				name: 'Marina and the Diamonds'
			};

			var user2 = {
				username: 'Meme',
				name: 'Melanie Martinez'
			};

			var user3 = {
				username: 'Hash',
				name: 'Hashley'
			};

			new_users = [user1,user2,user3];
			Users.create(new_users, function(err, users){
				assert.ifError(err);
				console.log('Adicionou pra testar');
				some_user_id = users[0]._id;
				done();
			});
		});


		it('Getting all the users', function(done){

			var url = URL_ROOT + '/users/';
			superagent.get(url).end(function(err, res){
				assert.ifError(err);
				console.log(res.body);
				assert.equal(res.body[0].username, 'Mama');
				assert.equal(res.body[2].username, 'Hash');
				done();
			});
		});

		it('Getting user by ID', function(done){

			var url = URL_ROOT + '/users/' + some_user_id;
			superagent.get(url).end(function(err,res){
				assert.ifError(err);
				console.log(res.body);
				assert.equal(res.body.username, 'Mama');
				done();
			});
		});

	});


	describe('Testando metodo POST', function(){

		var user1 = {
			username: 'Mari',
			name: 'Marina and the diamonds'
		};

		var user2 = {
			username: 'Jane',
			name: 'Jane Pusoninga'
		};

		var users = [user1,user2];

		it('Criando um novo user', function(done){
			var url = URL_ROOT + '/users/';
			superagent.post(url)
			.send(users).end(function(err, res){
				assert.ifError(err);

				Users.find({username: 'Mari'}, function(err,user){
					assert.ifError(err);
					console.log(user);
					assert.equal(user[0].username, 'Mari');
					console.log(res.body);
					done();
				});

			});
		});
		
	});


	describe('Testando metodo PUT', function(){

		it('Atualizando um user', function(done){
			var user1 = {
				username: 'Junny',
				name: 'Junny Lully'
			};

			var user_id;
			Users.create(user1, function(err, user){
				assert.ifError(err);
				user_id = user._id;
				console.log(user);

				var url = URL_ROOT + '/users/' + user_id;
				superagent.put(url)
				.send({
					name: 'Junny Bublly'
				}).end(function(err,res){
					assert.ifError(err);
					console.log(res.body);
					assert.equal(res.body.name, 'Junny Bublly');
					done();
				}); 
			});
		});
	});


	describe('Testando metodos DELETE', function(){

		var del_id;

		beforeEach(function(done){

			var user1 = {
				username: 'Buu',
				name: 'The diamonds'
			};

			var user2 = {
				username: 'Junina',
				name: 'Jane Ina'
			};

			users = [user1,user2];
			Users.create(users, function(err,del_users){
				assert.ifError(err);
				console.log('Adicionou pra ser deletado');
				console.log(del_users);
				del_id = del_users[1]._id;
				done();
			});

		});


		it('Deletando todos os users', function(done){

			var url = URL_ROOT + '/users/';
			superagent.del(url).end(function(err,res){
				assert.ifError(err);
				console.log(res.body);
				assert.deepEqual(res.body, { ok: 1, n: 2 });
				done();
			});

		});

		it('Deletando user com ID', function(done){

			var url = URL_ROOT + '/users/' + del_id;
			console.log(url);
			superagent.del(url).end(function(err,res){
				assert.ifError(err);
				console.log(res.body);
				assert.deepEqual(res.body.username, 'Junina');
				done();
			});
		});

	});

});