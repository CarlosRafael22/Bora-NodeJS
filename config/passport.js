var LocalStrategy = require('passport-local').Strategy;
//var passport = require('passport');
var Users = require('../models/user');


module.exports = function(passport){

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        Users.findById(id, function(err, user) {
            done(err, user);
        });
    });




	passport.use('local-login', new LocalStrategy({
		passReqToCallback: true //req vai ser passado com o primeiro argumento, assim a ordem dos parametros em baixo ta certo
	}, function(req,username,password,done){
		console.log(username);
		console.log(password);
		Users.findOne({'username': username}, function(err,user){
			if(err)
				return done(err);
			if(!user){
				console.log('User not registered with username: ' + username);
				return done(null,false, {message: 'This username is not registered'});
			}
			user.verifyPassword(password, function(err, isMatch){
				if(err) return done(err);
				if(!isMatch){
					console.log('Tem esse user mas senha nao bate');
					return done(null, false, {message: 'User exists but wrong password'});
				}else{
					console.log('Tem esse user e senha certas');
					console.log(req.user);
					return done(null, user);
				}
			});

		});
	}
	));

	passport.use('local-signup', new LocalStrategy({
		passReqToCallback: true
	}, function(req, username, password, done){

		console.log("Request body: %j", req.body);
		console.log(username);
		console.log(password);
		// asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        	// Quando for tentar registrar, primeiro eu vejo se ja tem um user com 
			//esse username, se nao tiver eu crio
			Users.findOne({'username': username}, function(err, user){
				if(err){
					console.log('Error in SignUp' + err);
					return done(err);
				}

				if(user){
					console.log('Username already in use');
					return done(null, false, {message: "Username already in use"});
				}else{
					// Ele da o hash no password no pre-save do user model
					//entao nao precisa fazer nada aqui em relacao a protecao da senha
					Users.create(req.body, function(err, user){
						if(err){
							console.log('Error in saving user: ' + err);
							throw err;
						}
						console.log('User registration successfull');
						return done(null, user);
					});
				}
			});
			});

		}));

    //});

		

}

//module.exports = passport;

