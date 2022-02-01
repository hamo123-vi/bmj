const Course = require('../models/Course')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Bootcamp = require('../models/Bootcamp')

// @desc     Show courses
// @route    GET/api/v1/courses
// @route    GET/api/v1/bootcamps/:bootcampId/courses
// @acces    Public

exports.getCourses = asyncHandler( async (req, res, next) => {
    let query;
    
    if(req.params.bootcampId) {
        query = Course.find({
            bootcamp: req.params.bootcampId
        });

    }   else {
        query = Course.find({}).populate({
            path: 'bootcamp',
            select: 'name description'
        });
    }
    const courses = await query;
    res.status(200).json({success: true, count: courses.length, data: courses});
});

// @desc     Show single course
// @route    GET/api/v1/courses/:courseId
// @acces    Public

exports.getCourse = asyncHandler( async (req, res, next) => {
    const course = await Course.findById(req.params.courseId).populate({
        path: 'bootcamps',
        select: 'name description bootcamp'
    });
    if(!course) {
        return next(
            new ErrorResponse(`No course with id ${req.params.courseId}`), 404
        );
    }
    res.status(200).json({success: true, data: course});
});

// @desc     Add course
// @route    POST/api/v1/bootcamps/:bootcampId/courses
// @acces    Private
exports.addCourse = asyncHandler( async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id
    const bootcamp = await Bootcamp.findById(req.body.bootcamp);
    if(!bootcamp) {
        return next();
    }

    //Make sure that user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`The user with id ${req.user.id} is not authorized to add course to this bootcamp`, 401)
        )
    }  

    const course = await Course.create(req.body);
    res.status(200).json({success: true, data: course});
});

// @desc     Update course
// @route    PUT/api/v1/courses/:courseId
// @acces    Private
exports.updateCourse = asyncHandler( async (req, res, next) => {
    let course = await Course.findById(req.params.courseId)
    if(!course) {
        return next(
            new ErrorResponse(`There is no course with id ${req.params.courseId}`, 400)
        );
    }

    //Make sure that user is course owner
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`The user with id ${req.user.id} is not authorized to update this object`, 401)
        )
    }

    course = await Course.findByIdAndUpdate(req.params.courseId, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({success: true, data: course})
});

// @desc     Delete course
// @route    DELETE/api/v1/courses/:courseId
// @acces    Private
exports.deleteCourse = asyncHandler( async (req, res, next) => {
    const course = await Course.findById(req.params.courseId)
    if(!course) {
        return next(
            new ErrorResponse('Can not delete course'), 404
        );
    }

//Make sure that user is course owner
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`The user with id ${req.user.id} is not authorized to delete this object`, 401)
        )
    }

    course.remove()

    res.status(200).json({success: true, data: []})
});