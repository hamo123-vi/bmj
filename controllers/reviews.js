const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp')
const asyncHandler = require('../middleware/async')
const advancedResults = require('../middleware/advancedResults');
const ErrorResponse = require('../utils/errorResponse');

// @desc     Show reviews
// @route    GET/api/v1/reviews
// @route    GET/api/v1/bootcamps/:bootcampId/reviews
// @acces    Public

exports.getReviews = asyncHandler( async (req, res, next) => {
    if(req.params.bootcampId) {
            const reviews = await Review.find({bootcamp: req.params.bootcampId})
            res.status(200).json({
                success: true,
                count: reviews.length,
                data: reviews
            })
    }   else {
            res.status(200).json(res.advancedResults);
    }
});

// @desc     Show single review
// @route    GET/api/v1/reviews/:id
// @acces    Public

exports.getReview = asyncHandler( async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if(!review) {
        return next(
            new ErrorResponse(`There is no review with id ${req.params.id}`, 404)
        )
    }

    res.status(200).json({
        success: true,
        data: review
    })
});

// @desc     Add review
// @route    POST/api/v1/reviews
// @acces    Private

exports.addReview = asyncHandler( async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if(!bootcamp) {
        return next(
            new ErrorResponse(`No bootcamp with id ${req.params.bootcampId}`, 404)
        )
    }

    const review = await Review.create(req.body)

    res.status(200).json({
        success: true,
        data: review
    })
});


// @desc     Update review
// @route    PUT/api/v1/reviews/:id
// @acces    Private

exports.updateReview = asyncHandler( async (req, res, next) => {
    let review = await Review.findById(req.params.id);
    if(!review) {
        return next(
            new ErrorResponse(`No review with id ${req.params.bootcampId}`, 404)
        )
    }

    //Check OWNERSHIP of Review
    if(review.user.toString() !== req.user.id && req.user.role !== 'admiin') {
        return next(
            new ErrorResponse('You are not authorized to update this review', 404)
        )
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body);

    res.status(200).json({
        success: true,
        data: review
    })
});

// @desc     Delete review
// @route    DELETE/api/v1/reviews/:id
// @acces    Private

exports.deleteReview = asyncHandler( async (req, res, next) => {
    let review = await Review.findById(req.params.id);
    if(!review) {
        return next(
            new ErrorResponse(`No review with id ${req.params.bootcampId}`, 404)
        )
    }

    //Check OWNERSHIP of Review
    if(review.user.toString() !== req.user.id && req.user.role !== 'admiin') {
        return next(
            new ErrorResponse('You are not authorized to delete this review', 404)
        )
    }

    await review.remove();

    res.status(200).json({
        success: true,
        data: []
    })
});