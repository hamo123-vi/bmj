const express = require('express');
const { protect } = require('../middleware/auth')
const advancedResults = require('../middleware/advancedResults');
const { authorize } = require('../middleware/auth');
const User = require('../models/User')
const {
    getUsers,
    getUser,
    addUser,
    updateUser,
    deleteUser
} = require('../controllers/users');
const router = express.Router();

router.use(protect, authorize('admin'));

router.route('/').get(advancedResults(User), getUsers).post(addUser)
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser)

module.exports = router;