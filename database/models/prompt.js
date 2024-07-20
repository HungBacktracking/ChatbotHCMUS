const { Schema, model, Document } = require('mongoose');

const PromptSchema = new Schema({
    mode: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    content: {
        type: String,
        required: true,
    },
});

module.exports = model('prompt', PromptSchema);
