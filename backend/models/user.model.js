const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    section: {
        type: String,
        required: true,
        trim: true,
        enum: ['Users', 'Tickets', 'KB'],
    },
    message: {
        type: String,
        required: true,
        immutable: true,
    },
    date: {
        type: Date,
        required: true,
        immutable: true,
    },
})

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
        trim: true,
        select: false,
    },
    salt: {
        type: String,
        required: true,
        trim: true,
        select: false,
    },
    role: {
        type: String,
        required: true,
        trim: true,
        default: 'User',
        enum: ['User', 'Administrator'],
    },
    avatar: {
        type: String,
        trim: true,
    },
    notifications: [notificationSchema], 
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;