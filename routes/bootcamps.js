const express = require('express');
const router = express.Router();
const { getBootcamps,
        getBootcamp,
        createBootcamp,
        updateBootcamp,
        deleteBootcamp,
        getBootcampsInRadius,
        uploadBootcampPhoto
      } = require('../controllers/bootcamps');

const { protect, authorize } = require('../middleware/auth')
const advancedResults = require('../middleware/advancedResults')
const Bootcamp = require('../models/Bootcamp')

//Import other resource routes
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');


//Re-route other resource routes
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance')
.get(getBootcampsInRadius)

router.route('/')
.get(advancedResults(Bootcamp, 'courses reviews') ,getBootcamps)
.post(protect, authorize('publisher', 'admin'), createBootcamp)

router.route('/:id')
.get(getBootcamp)
.put(protect, authorize('publisher', 'admin'), updateBootcamp)
.delete(protect, authorize('publisher', 'admin'), deleteBootcamp)

router.route('/:id/photo').put(protect, authorize('admin', 'publisher'), uploadBootcampPhoto)



module.exports = router;