const { Schema, model, Document } = require('mongoose');
const GenderEnum = require('./GenderEnum');

const ChatRoomSchema = new Schema({
  id1: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  id2: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  gender1: {
    type: String,
    enum: Object.keys(GenderEnum),
    required: true,
  },
  gender2: {
    type: String,
    enum: Object.keys(GenderEnum),
    required: true,
  },
  time: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = model('chatroom', ChatRoomSchema);
