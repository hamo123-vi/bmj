const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const advancedResults = require('../middleware/advancedResults')

// @desc     Get all users
// @route    GET/api/v1/auth/users
// @acces    Public
exports.getUsers = asyncHandler( async(req, res, next) => {
    const users = await User.find({role:{$ne : req.params.role}})
    res.status(200).json(success: true, data: users)
});

// @desc     Get single user
// @route    GET/api/v1/auth/users/:id
// @acces    Public
exports.getUser = asyncHandler( async(req, res, next) => {
    const user = await User.findById(req.params.id);
    if(user.role != req.params.role) {
    res.status(200).json({success: true, data: user})
    } else {
        res.status(401).json({success: false, message: "Forbidden"})
    }
});