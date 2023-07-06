/**
 *  auth.js
 *  @description :: routes for authentications of APIs
 */

const express = require("express");
const router = express.Router();
const auth = require('../../../middleware/auth');
const authController = require("../../../controller/userapp/v1/authController");
const {PLATFORM} = require("../../../constants/authConstant");

router.post('/register', authController.register);
router.post('/login', authController.login);
router.route('/reset-password').put(authController.resetPassword);
router.route('/reset-password-otp').post(authController.sentResetPasswordOtp);
router.route('/validate-otp').post(authController.validateOtp);
router.route('/logout').post(auth(PLATFORM.USERAPP), authController.logout);
router.get('/login/google', (req, res) => {
    req.session.platform = 'userapp';
    res.redirect(`http://localhost:${process.env.PORT}/auth/google`);
  });



module.exports = router;