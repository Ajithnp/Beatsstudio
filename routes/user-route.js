const express  = require('express')
const userRoute = express.Router()
const userController = require('../controllers/user/userController/userContoller')
const passport = require ('passport')
const storeController = require('../controllers/user/userStoreController/store-controller')

userRoute.route('/')
       .get(userController.getLandingPage)

       console.log('in user router below landing page=========')

// Login
userRoute.route('/user/signup')
         .get(userController.userSignup)
         .post(userController.userRegistration)

//OTP
userRoute.route('/user/otp')
          .get(userController.getOtpPage)
          .post(userController.verifyOtp)

userRoute.route('/user/resendOtp')
         .post(userController.resendOtp)  

// User google sign route
userRoute.route('/auth/google')
         .get(passport.authenticate('google',{scope:['profile', 'email']}));
  // Sign success snd failure response
  
 userRoute.route('/auth/google/callback')
        .get(passport.authenticate('google', { failureRedirect: '/user/signup'}),
        (req, res)=> {
                //success login
                // store user info: in session
                req.session.user = {
                       name: req.user.name,
                       id: req.user._id
                }
                console.log('data from route', req.session.user);
                             res.redirect('/')
        }
   ); 
         
userRoute.route('/user/login')
        .get(userController.loadLogin) 
        .post(userController.verifyLogin)
        
userRoute.route('/user/logout')
        .post(userController.userLogout)        

//User -Store
userRoute.route('/user/store')
          .get(storeController.getStorePage)      
          
          






          
module.exports = userRoute