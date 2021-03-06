var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var RoleSchema = new Schema({
  name: {
    type: String,
    index: {
      unique: true
    },
    required: true
  },
  createdBy: String,
  when: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('Role', RoleSchema);
