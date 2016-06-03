var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Users = require('../models/user');
//var passport = require('../config/passport');
var passport = require('passport');
require('../config/passport')(passport);

var userRouter = express.Router();

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });
userRouter.route('/')
.get(function(req,res,next){
	Users.find({}, function(err,users){
		if(err) throw err;
		res.json(users);
	});
})
.post(function(req,res,next){
	Users.create(req.body, function(err,user){
		if(err) throw err;

		var id = user._id;
		res.writeHead(200, {
			'Content-Type' : 'text/plain'
		});
		res.end('Added user with id: ' + id);
	});
})
.delete(function(req,res,next){
	Users.remove({}, function(err, resp){
		if(err) throw err;
		res.json(resp);
	});
});

// userRouter.post('/signup', 
// 	passport.authenticate('local-signup'),
// 	function(req,res){
// 		// req.login(user, function(err) {
//   // 			if (err) { return next(err); }
//   // 			//return res.redirect('/users/' + req.user.username);
//   // 			console.log('Signup deu tudo certo');
// 		// });
// 		console.log('Signup deu tudo certo');
// });

// userRouter.post('/login', 
// 	passport.authenticate('local-login'),
// 	function(err,user,info){
// 		// req.login(req.user, function(err) {
//   // 			if (err) { return next(err); }
//   // 			//return res.redirect('/users/' + req.user.username);
//   // 			console.log('Login deu tudo certo');
// 		// });

// 		console.log('Login de certo, user ' + username);
// 	});
// 		//console.log('Login deu tudo certo');

// 	// passport.authenticate('local-login', {
//  //    successRedirect: '/loginSuccess',
//  //    failureRedirect: '/loginFailure'
//  //  })
// 	//);

userRouter.post('/signup', function(req,res,next){
	passport.authenticate('local-signup', function(err,user,info){
		if(err) return next(err);
		//Dentro do local-signup se tiver ja tiver user ele retorna done(null, false)
		//entao no caso, o segundo parametro(false) vai ser o parametro user daqui da funcao
		if(!user){
			console.log(info);
			return res.json(403, {message: "This username has already been taken"});
		}
		req.login(user, function(err) {
  			if (err) { return next(err); }
  			console.log('Signup deu certo');
  			//iSSO EH O QUE RETORNA TANTO PRO POSTMAN QUANTO PRO LOG DO ANDROID
  			return res.json(200,{message: "User signed up and logged in", user: req.user});
		});
	})(req,res,next);
});

userRouter.post('/login', function(req,res,next){
	passport.authenticate('local-login', function(err,user, info){
		console.log("User: %j", user);
		//console.log("User request: %j", req.session.passport.user);
		if(err) return next(err);
		if(!user){
			console.log("Info: %j", info);
			console.log(info.message);
			return res.json(403,{message: info.message});
		}
		req.login(user, function(err) {
  			if (err) { return next(err); }
  			console.log('Login deu tudo certo');
  			return res.json(200,{message: "User logged in", user: req.user});
		});
	})(req,res,next);
});

// userRouter.post('/signup',
// 	passport.authenticate('local-signup',
// 		{successRedirect : '/loginSuccess',
// 		 failureRedirect : '/loginFailure'})
// 	);

// userRouter.post('/login',
//   passport.authenticate('local-login', 
//   	{ successRedirect: '/loginSuccess',
//       failureRedirect: '/loginFailure' })
//   );


userRouter.get('/isloggedin', function(req,res){
	if(req.user){
		res.json(req.user);
	}else{
		res.send('Failed to authenticate');
	}
});

userRouter.get('/logout', function(req,res, next){
	console.log(req.user);
	req.logout();
	req.session.destroy( function ( err ) {
		if(err) return next(err);
    	res.send( { message: 'Successfully logged out' } );
    	console.log('User session destroyed');
	});
  	console.log('User logged out');
});

userRouter.get('/loginFailure', function(req, res, next) {
  res.send('Failed to authenticate');
});

userRouter.get('/loginSuccess', function(req, res, next) {
  res.send('Successfully authenticated');
});

userRouter.route('/:userId')
.get(function(req,res,next){
	console.log(req.params.userId);
	Users.findById(req.params.userId, function(err,user){
		if(err) throw err;
		res.json(user);
	});
})
.put(function(req,res,next){
	Users.findByIdAndUpdate(req.params.userId, 
		{$set: req.body}, {new: true}, function(err,user){
			if(err) throw err;
			res.json(user);
		});
})
.delete(function(req,res,next){
	Users.findByIdAndRemove(req.params.userId, function(err, resp){
		if(err) throw err;
		console.log(resp);
		res.json(resp);
	});
});

//SO PRA TESTAR SE A FUNCAO DE CHECKAR A PASSWORD TAVA FUNCIONANDO
//TEM QUE FAZER ISSO EM NO ARQUIVO DE TESTES USERTEST
userRouter.route('/password/:userId')
.get(function(req,res,next){
	console.log(req.params.userPassword);
	Users.findOne({_id: req.params.userId}, function(err, user){
		if(err) throw err;

		// test a matching password
    user.verifyPassword('lovi', function(err, isMatch) {
        if (err) throw err;
        console.log('lovi:', isMatch); // -&gt; Password123: true
    });

    // test a failing password
    user.verifyPassword('love', function(err, isMatch) {
        if (err) throw err;
        console.log('love:', isMatch); // -&gt; 123Password: false
    });

    res.json(user);
	});
});

module.exports = userRouter;
