import { Router } from 'express';
import {createPaymentHandler, getAllPaymentHandler, getSingleUserPaymentsHandler} from '../controllers/paymentsController.js';
import {verifyToken} from '../middleware/authMiddleware.js'
import { validatePayment } from '../services/payments/paymentsService.js';


const router = Router();

router.post('/createPayment', verifyToken, validatePayment, createPaymentHandler);
router.get('/getAllPayment', verifyToken, getAllPaymentHandler);
router.get('/getSinglePayment/:userId', verifyToken, getSingleUserPaymentsHandler);


export default router;
