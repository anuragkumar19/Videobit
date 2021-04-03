const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    provider: {
        type: String,
        enum: ['google', 'facebook'],
        required: true,
    },

    googleId: {
        type: String,
        required: function () {
            return this.provider === 'google';
        },
    },

    facebookId: {
        type: String,
        required: function () {
            return this.provider === 'facebook';
        },
    },

    image: {
        type: String,
        default: '/img/user.png',
        required: true,
    },

    rooms: [{ type: Schema.Types.ObjectId, ref: 'Room' }],

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = model('User', userSchema);
