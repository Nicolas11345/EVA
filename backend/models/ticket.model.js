const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        immutable: true,
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

const ticketSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    submitter: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        immutable: true,
    },
    assignee: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    priority: {
        type: String,
        required: true,
        trim: true,
        default: 'Normal',
        enum: ['Low', 'Normal', 'High'],
    },
    status: {
        type: String,
        required: true,
        trim: true,
        default: 'Open',
        enum: ['Open', 'Closed'],
    },
    created: {
        type: Date,
        required: true,
        immutable: true,
    },
    chat: [chatSchema], 
}, {
    timestamps: true,
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;