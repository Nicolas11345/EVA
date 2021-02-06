const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const knowledgeSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    type: {
        type: String,
        required: true,
        default: 'Text',
        enum: ['Text', 'File'],
    },
    answer: {
        type: String,
        required: true,
    },
    trainingQuestions: [{
        type: String,
        required: true,
    }],
}, {
    timestamps: true,
});

const Knowledge = mongoose.model('Knowledge', knowledgeSchema);

module.exports = Knowledge;