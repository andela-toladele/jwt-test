var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');
 
var UserSchema   = new Schema({
    email: String,
    username: String,
    password: String,
    token: String,
    userType: {type: String, default: 'user'},
    role: {type: String, default: 'VOLUNTEER'},
    permission: [String]    
});

// methods ======================
// generating a hash
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};
 
module.exports = mongoose.model('User', UserSchema);