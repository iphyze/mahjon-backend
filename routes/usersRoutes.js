import { Router } from 'express';
import {getAllUsersHandler, getSingleUserHandler, deleteUsersHandler, updateUserHandler} from '../controllers/usersController.js';
import {verifyToken} from '../middleware/authMiddleware.js'


const router = Router();

router.get('/getAllUsers', verifyToken, getAllUsersHandler);
router.get('/getSingleUser/:id', verifyToken, getSingleUserHandler);
router.delete('/deleteUsers', verifyToken, deleteUsersHandler);
router.put('/updateUser/:id', verifyToken, updateUserHandler);



// Update user
// router.put('/update/:id', verifyToken, updateUser);


export default router;
