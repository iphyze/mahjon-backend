import { Router } from 'express';
import { loginHandler, registerUser} from '../controllers/authController.js';
import {verifyToken} from '../middleware/authMiddleware.js'
import { validateUserRegistration } from '../services/users/createUserService.js';


const router = Router();


router.post('/login', loginHandler);
router.post('/register', validateUserRegistration, registerUser);

// Update user
// router.put('/update/:id', verifyToken, updateUser);


export default router;
