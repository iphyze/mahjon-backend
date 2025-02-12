import { Router } from 'express';
import { loginHandler, registerUser, sendVerificationCode, verifyEmailHandler, forgotPasswordHandler, updatePasswordHandler} from '../controllers/authController.js';
import {verifyToken} from '../middleware/authMiddleware.js'
import { validateUserRegistration, validateForgotPassword, validateUpdatePassword, validateEmail } from '../services/users/authService.js';


const router = Router();


router.post('/login', loginHandler);
router.post('/register', validateUserRegistration, registerUser);
router.post('/sendVerificationCode', validateEmail, sendVerificationCode);
router.post('/verifyEmail', validateEmail, verifyEmailHandler);
router.post('/forgotPassword', validateForgotPassword, forgotPasswordHandler);
router.put('/updatePassword/:id', verifyToken, validateUpdatePassword, updatePasswordHandler);


export default router;
