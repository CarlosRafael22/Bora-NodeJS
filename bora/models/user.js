var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var userSchema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	email:{
		type: String,
		required: true
	},
	password:{
		type:String,
		required: true
	},
	name: {
		type: String,
		required: false
	},
	interests:{
		type: [String],
		required:false
	},
	picture: {
      type: String,
      required: false,
      match: /^http:\/\//i
    },
    oauth: { type: String, required: false }
},{
	timestamps: true
});

userSchema.pre('save', function(next){ 
	var user = this;
// only hash the password if it has been modified (or is new)
if (!user.isModified('password')) return next();

// generate a salt
bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);

        // override the cleartext password with the hashed one
        user.password = hash;
        next();
    });
  });
});

//Verifica se a password dada bate com a do user no banco
userSchema.methods.verifyPassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};


var Users = mongoose.model('User', userSchema);

module.exports = Users;