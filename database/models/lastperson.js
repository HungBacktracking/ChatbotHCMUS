const { Schema, model, Document } = require('mongoose');

const LastPersonSchema = new Schema({
  id1: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  id2: {
    type: String,
    required: true,
  },
});


module.exports = model('lastperson', LastPersonSchema);
