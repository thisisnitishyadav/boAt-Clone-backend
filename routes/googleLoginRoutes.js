/**
 * googleLogin.js
 * @description :: routes of google authentication
 */
 
const express = require('express');
const router = express.Router();
const passport = require('passport');
const dotenv = require("dotenv");
dotenv.config({path:".env"});

const { socialLogin } = require('../services/auth');



router.get('/auth/google/error', (req, res) => {
  res.loginFailed({ message:'Login Failed' });
});

router.get('/auth/google',passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session:false 
}));

router.get('/auth/google/callback',
  (req,res,next)=>{
    passport.authenticate('google', { failureRedirect: process.env.GOOGLE_ERRORURL }, async (error, user , info) => {
      if (error){
        return res.internalServerError({ message:error.message });
      }
      if (user){
        try {
          let result = await socialLogin(user.email, req.session.platform);
          if (result.flag) {
            return res.failure({ message: result.data });
          }
          res.cookie("authCookie",result.data.token)
          res.redirect(process.env.GOOGLE_REDIRECTURL)
          // return res.success({
          //   data: result.data,
          //   message:'Login Successful' 
          // });
        } catch (error) {
          return res.internalServerError({ message: error.message });
        }
      }
    })(req,res,next);
  }); 

module.exports = router;