const { Schema, model } = require('mongoose');
const GenderEnum = require('./GenderEnum');


const PartSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
}, { _id: false });


const MessageSchema = new Schema({
  role: {
    type: String,
    enum: ['user', 'model'],
    required: true,
  },
  parts: {
    type: [PartSchema],
    required: true,
  },
}, { _id: false });



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
    type: [MessageSchema],
    default: [],
  }
});

module.exports = model('user', UserSchema);
