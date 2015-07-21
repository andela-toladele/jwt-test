var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TaskSchema = new Schema({
  name: String,
  createdBy: String,
  startWhen: {
    type: Date,
    default: Date.now()
  },
  endWhen: {
    type: Date,
    default: Date.now()
  },
  completed: {
    type: Boolean,
    default: false
  },
  assignedTo: [{
    name: String,
    startWhen: {
      type: Date,
      default: Date.now()
    },
    endWhen: {
      type: Date,
      default: Date.now()
    },
    completed: {
      type: Boolean,
      default: false
    }
  }]
});

module.exports = mongoose.model('Task', TaskSchema);
