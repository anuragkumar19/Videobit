const { Schema, model } = require('mongoose');

const roomSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    detail: {
        type: String,
        required: false,
        trim: true,
    },

    password: {
        type: String,
        required: true,
    },

    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = model('Room', roomSchema);
