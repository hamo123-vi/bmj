const path = require('path')
const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')
const geocoder = require('../utils/geocoder')
const asyncHandler = require('../middleware/async')

// @desc     Show bootcamps
// @route    GET/api/v1/bootcamps
// @acces    Public
exports.getBootcamps = asyncHandler( async (req, res, next) => {
        res.status(200).json(res.advancedResults)

});

// @desc     Show bootcamp
// @route    GET/api/v1/bootcamps/:id
// @acces    Public
exports.getBootcamp = asyncHandler( async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if(!bootcamp) {
            return next(new ErrorResponse(`Resource with id ${res.params.id} can not be found`, 404))
        }
        res.status(200).json({success: true, data: bootcamp})
});

// @desc     Get Bootcamps in radius
// @route    GET/api/v1/bootcamps/radius/:zipcode/:distance
// @acces    Public
exports.getBootcampsInRadius = asyncHandler( async (req, res, next) => {
    
    const { zipcode, distance } = req.params;

    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [ [ lng, lat ], distance / 3963.2 ] } }
    });

    res.status(200).json({success: true, count: bootcamps.length, data: bootcamps});
});

// @desc     Create bootcamp
// @route    POST/api/v1/bootcamps
// @acces    Private
exports.createBootcamp = asyncHandler( async (req, res, next) => {
        req.body.user = req.user.id

        //Check if user already published bootcamp
        const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

        //If user is not admin can not publish more than one bootcamp
        if(publishedBootcamp && req.user.role !== 'admin') {
            return next(
                new ErrorResponse(`The user with id ${req.user.id} has already published one bootcamp`, 400)
            )
        }

        const bootcamp = await Bootcamp.create(req.body)

        res.status(201).json({
            success: true,
            body: bootcamp
        })
   
});

// @desc     Update bootcamp
// @route    PUT/api/v1/bootcamps/:id
// @acces    Private
exports.updateBootcamp = asyncHandler( async (req, res, next) => {
        let bootcamp = await Bootcamp.findById(req.params.id)

        if(!bootcamp) {
            return next(new ErrorResponse(`Resource with id ${res.params.id} can not be found`, 404))
        }

        //Make sure that user is bootcamp owner
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(
                new ErrorResponse(`The user with id ${req.user.id} is not authorized to update this object`, 401)
            )
        }

        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        res.status(200).json({success: true, data: bootcamp})
});

// @desc     Delete bootcamp
// @route    DELETE/api/v1/bootcamps/:id
// @acces    Private
exports.deleteBootcamp = asyncHandler( async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id)

        if(!bootcamp) {
            return next(new ErrorResponse(`Resource with id ${res.params.id} can not be found`, 404))
        }

        //Make sure that user is bootcamp owner
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(
                new ErrorResponse(`The user with id ${req.user.id} is not authorized to delete this object`, 401)
            )}

        bootcamp.remove();
        res.status(200).json({success: true, data: []})
});

// @desc     Upload bootcamp photo
// @route    PUT/api/v1/bootcamps/:id/photo
// @acces    Private
exports.uploadBootcampPhoto = asyncHandler( async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    
    if(!bootcamp) {
        return next(new ErrorResponse(`Resource with id ${req.params.id} can not be found`, 404))
    }

    //Make sure that user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`The user with id ${req.user.id} is not authorized to update this object`, 401)
        )
    }

    if(!req.files) {
        return next(
            new ErrorResponse('Please upload a file', 400)
        )
    }

    const file = req.files.file

    if(!file.mimetype.startsWith('image')){
        return next(
           new ErrorResponse('File must be a photo', 400)
        )
    }

    if(file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(`File must be smaller than ${process.env.MAX_FILE_UPLOAD} bytes`)
        )
    }

    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err) {
            return next(
                new ErrorResponse('Problem with file upload', 500)
            )
        }

        await Bootcamp.findByIdAndUpdate(bootcamp._id, {
            photo: file.name
        })
    })

    res.status(200).json({
        success: true,
        data: file.name
    })
});