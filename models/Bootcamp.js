const mongoose = require('mongoose')
const slugify = require('slugify')
const geocoder = require('../utils/geocoder')

const BootcampSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'This field can not be empty'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not contain more than 50 characters']
    },

    slug: String,

    description: {
        type: String,
        required: [true, 'This field can not be empty'],
        maxlength: [500, 'Name can not contain more than 500 characters']
    },

    website: {
        type:String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please enter valid URL with http:// or https://'
        ]
    },

    email: {
        type: String,
        match: [
            /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
            'Please enter valid email address'
        ]
    },

    phone: {
        type: String
    },

    address: 
    {
        type: String,
        required: [true, 'This field can not be empty']
    },

    location: {
        //GeoJSON point
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: {
          type: [Number],
          index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
      },

      careers: {
          type: [String],
          required: true,
          enum: [
            "Mobile Development",
			"Web Development",
			"Data Science",
			"Business",
            "UI/UX"
          ]
      },

      averageRating: Number,

      averageCost: Number,

      photo:{
        type: String,
        default: 'no-photo.jpg'
      },

      housing: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//Creating slug from name
BootcampSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: true})
    next()
})

//Creating location with Node Geocoder
BootcampSchema.pre('save', async function(next) {
    const loc = await geocoder.geocode(this.address)
    this.location = {
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    }
    this.address = undefined
    next()
})

//Reverse populate with virtuals

BootcampSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false
});

BootcampSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false
});

//Cascade delete courses before delete their bootcamp
BootcampSchema.pre('remove', async function(next) {
    await this.model('Course').deleteMany({ bootcamp: this._id});
    next();
})


module.exports = mongoose.model('Bootcamp', BootcampSchema)

