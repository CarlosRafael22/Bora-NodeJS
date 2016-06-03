function setupAuth(User, app) {
  var express = require('express');
  var passport = require('passport');
  var FacebookStrategy = require('passport-facebook').Strategy;

  var session = require('express-session');

  //Importando pra pegar o AppID e AppSecret do Facebook
  var config = require('./config');

  // High level serialize/de-serialize configuration for passport
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.
      findOne({ _id : id }).
      exec(done);
  });

  // Facebook-specific
  passport.use(new FacebookStrategy(
    {
      //clientID: process.env.FACEBOOK_CLIENT_ID,
      clientID: config.FACEBOOK_CLIENT_ID,
      //clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      clientSecret: config.FACEBOOK_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/facebook/callback'
    },
    function(accessToken, refreshToken, profile, done) {
      if (!profile.emails || !profile.emails.length) {
        return done('No emails associated with this account!');
      }

      User.findOneAndUpdate(
        { 'oauth': profile.id },
        {
          $set: {
            'username': profile.emails[0].value,
            'picture': 'http://graph.facebook.com/' +
              profile.id.toString() + '/picture?type=large'
          }
        },
        { 'new': true, upsert: true, runValidators: true },
        function(error, user) {
          done(error, user);
        });
    }));

  // Express routes for auth
  //Starts the login process in this route
  //scope: We are requesting the email address
  app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: ['email'] }));

//Facebook send user back here after the have logged in
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/fail' }),
    function(req, res) {
      res.send('Welcome, ' + req.user.profile.username);
    });
}

module.exports = setupAuth;
