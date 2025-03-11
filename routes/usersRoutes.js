import { Router } from 'express';
import {getAllUsersHandler, getSingleUserHandler, deleteUsersHandler, 
    updateUserHandler, notificationHandler, getUserNoticeHandler, markNoticeHandler,
    updatePushTokenHandler, updateUserDataHandler
} from '../controllers/usersController.js';
import {verifyToken} from '../middleware/authMiddleware.js'
import { validateNotification, validateUserIdNotification, validateMarkNotification } from '../services/users/usersService.js';


const router = Router();

router.get('/getAllUsers', verifyToken, getAllUsersHandler);
router.get('/getSingleUser/:id', verifyToken, getSingleUserHandler);
router.delete('/deleteUsers', verifyToken, deleteUsersHandler);
router.put('/updateUser/:id', verifyToken, updateUserDataHandler);
router.put('/updateUserData/:id', verifyToken, updateUserHandler);
router.post('/notifications/addNotification', verifyToken, validateNotification, notificationHandler);
router.get('/notifications/getNotifications/:userId', verifyToken, validateUserIdNotification, getUserNoticeHandler);
router.patch('/notifications/status', verifyToken, validateMarkNotification, markNoticeHandler);
router.post('/notifications/update-push-token', verifyToken, updatePushTokenHandler);



// Update user
// router.put('/update/:id', verifyToken, updateUser);


export default router;
