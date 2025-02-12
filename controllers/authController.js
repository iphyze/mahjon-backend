import {createUser, loginUser, resendVerificationEmail, verifyEmail, forgotPassword, updatePassword} from '../services/users/authService.js';


export const loginHandler = loginUser;
export const registerUser = createUser;
export const sendVerificationCode = resendVerificationEmail;
export const verifyEmailHandler = verifyEmail;
export const forgotPasswordHandler = forgotPassword;
export const updatePasswordHandler = updatePassword;
