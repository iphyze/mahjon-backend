import {createPayment, getAllPayments, getSingleUserPayments} from '../services/payments/paymentsService.js';


export const createPaymentHandler = createPayment;
export const getAllPaymentHandler = getAllPayments;
export const getSingleUserPaymentsHandler = getSingleUserPayments;

