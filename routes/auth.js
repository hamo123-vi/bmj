const express = require('express');
const { protect } = require('../middleware/auth')
const {
    register,
    login,
    logout,
    getMe,
    forgot,
    resetPassword,
    updateDetails,
    updatePassword
} = require('../controllers/auth');
const router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgot);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;