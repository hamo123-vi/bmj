const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Please add a name']
    },

    email: {
        type: String,
        required: [true, 'Please add an email'],
        match: [
            /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
            'Please enter valid email address'
        ]
    },

    phoneNumber: {
        type: Number,
        required: [true, 'Please enter phone number'],
        minlength: 9,
        maxlength: 10
    },

    role: {
        type: String,
        enum: ['employee', 'employer'],
        required: [true, 'Please select your role'],
    },

    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 8,
        select: false
    },
    
    resetPasswordToken: {
        type: String,
        default: undefined
    },

    resetPasswordExpire: {
        type: Date,
        default: undefined
    },

    averageRating: Number

});

UserSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
    })
}

UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

//Reverse populate with virtuals

BootcampSchema.virtual('jobs', {
    ref: 'Job',
    localField: '_id',
    foreignField: 'user',
    justOne: false
});

BootcampSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'user',
    justOne: false
});

//Cascade delete reviews before delete their user
BootcampSchema.pre('remove', async function(next) {
    await this.model('Review').deleteMany({ user: this._id});
    next();
})

//Cascade delete jobs before delete their user
BootcampSchema.pre('remove', async function(next) {
    await this.model('Job').deleteMany({ user: this._id});
    next();
})

module.exports = mongoose.model('User', UserSchema);