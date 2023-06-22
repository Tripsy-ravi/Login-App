import { Router } from "express";
const router = Router();

/** import all controllers */
import * as controller from '../controllers/appController.js';
import { registerMail } from '../controllers/mailer.js'
import {Auth,localVariables} from '../middleware/auth.js';


// /** POST Methods */
router.post('/register', controller.register); // register user
router.post('/registerMail',registerMail); // send the email
// router.route('/authenticate').post((req, res) => res.end()); // authenticate user
router.post('/login',controller.verifyUser, controller.login); // login in app

// /** GET Methods */
router.get('/user/:username',controller.getUser) // user with username
router.get('/generateOTP',controller.verifyUser, localVariables, controller.generateOTP) // generate random OTP
router.get('/verifyOTP',controller.verifyOTP) // verify generated OTP
router.get('/createResetSession',controller.createResetSession) // reset all the variables


/** PUT Methods */
router.put('/updateuser', Auth, controller.updateUser); // is use to update the user profile
router.put('/resetPassword',controller.verifyUser, controller.resetPassword); // use to reset password



export default router;