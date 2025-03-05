import { Router } from 'express';
import {createPaymentHandler} from '../controllers/paymentsController.js';
import {verifyToken} from '../middleware/authMiddleware.js'
import { validatePayment } from '../services/payments/paymentsService.js';


const router = Router();

router.post('/createPayment', verifyToken, validatePayment, createPaymentHandler);
// router.get('/getSingleUser/:id', verifyToken, getSingleUserHandler);


export default router;
