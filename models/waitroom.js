const { Schema, model, Document } = require('mongoose');
const GenderEnum = require('./GenderEnum');

const WaitRoomSchema = new Schema({
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
  targetGender: {
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


module.exports = model('waitroom', WaitRoomSchema);
