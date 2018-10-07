var mongoose = require("mongoose");

var Schema = mongoose.Schema;


var noteSchema = new Schema({
 
  _headlineId: {
    type: Schema.Types.ObjectId,
    ref: "Headline"
  },
  date: {
    type: Date,
    default: Date.now
  },
  noteText: String

  /* title: {
    type: String,
    required: true
  },
  body: String,
  noteText: String */
});

// This creates our model from the above schema, using mongoose's model method
var Note = mongoose.model("Note", noteSchema);

// Export the Note model
module.exports = Note;
