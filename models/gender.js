const { Schema, model } = require('mongoose');
const GenderEnum = require('./GenderEnum');

const GenderSchema = new Schema({
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
});

module.exports = model('gender', GenderSchema);
