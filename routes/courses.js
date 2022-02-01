const express = require('express');
const { protect, authorize } = require('../middleware/auth')
const router = express.Router({ mergeParams: true });
const { getCourses,
        getCourse,
        addCourse,
        updateCourse,
        deleteCourse
            } = require('../controllers/courses');

router.route('/').get(getCourses).post(protect, authorize('publisher', 'admin'), addCourse);
router.route('/:courseId').get(getCourse).put(protect, authorize('publisher', 'admin'), updateCourse).delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;