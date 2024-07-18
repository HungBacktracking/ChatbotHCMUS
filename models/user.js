const { Schema, model } = require('mongoose');
const GenderEnum = require('./GenderEnum');

const UserSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  gender: {
    type: String,
    enum: Object.keys(GenderEnum),
    required: true,
  },
  chatHistory: {
    type: [String],
    default: [],
  }
});

module.exports = model('user', UserSchema);
