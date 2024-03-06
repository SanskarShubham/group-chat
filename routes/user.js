const express = require('express');

const user = require('../controllers/user');

const router = express.Router();

router.post('/signup',user.postSignup)
router.post('/login',user.postLogin)

// FORGET PASSWORD ROUTES 
router.post('/forgot-password',user.postForgotPassword)
router.get('/resetpassword/:id',user.postResetPassword)
router.get('/update-password/:id',user.postUpdatePassword)


module.exports = router;