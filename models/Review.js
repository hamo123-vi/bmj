const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({

    text: {
        type: String,
        required: [true, 'Please add some text for review']
    },

    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please add rating from 1 to 5']
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
});

//Prevent user to leave more than 1 review
ReviewSchema.index({user: 1}, {unique: true});

ReviewSchema.statics.getAverageRating = async function(userId) {
    const obj = await this.aggregate([
        {
        $match: { user: userId}
        },
        {
        $group: 
        {
            _id: '$user',
            averageRating: { $avg: '$rating'}
        }
    }
    ]);
    try{
        await this.model('User').findByIdAndUpdate(userId, 
            {
                _id: userId,
                averageRating: obj[0].averageRating
            });
    } catch(err) {
        console.log(err)
    }

}

ReviewSchema.post('save', function() {
    this.constructor.getAverageRating(this.userId);
});

ReviewSchema.pre('remove', function() {
    this.constructor.getAverageRating(this.userId);
})

module.exports = mongoose.model('Review', ReviewSchema)