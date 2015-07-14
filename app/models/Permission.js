var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
 
var PermissionSchema   = new Schema({
    name: {type: String, unique:true},
    createdBy: String,
    when: {type: Date, default: Date.now()},
    roles: [String]
});
 
module.exports = mongoose.model('Permission', PermissionSchema);