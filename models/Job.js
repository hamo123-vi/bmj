const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add course title']
    },

    description: {
        type: String,
        required: [true, 'Please add course description']
    },

    date: {
        type: date,
        default: Date.now
    },

    price: {
        type: Number,
        required: [true, 'Please add price']
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },

    active: {
        type: Boolean,
        required: true,
        default: true
    }
});

module.exports = mongoose.model('Job', JobSchema)