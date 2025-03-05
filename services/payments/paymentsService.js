import db from '../../config/db.js';
import dotenv from 'dotenv';
import { check, validationResult } from 'express-validator';
import { paymentConfirmationTemplate } from '../../utils/paymentEmailTemplates.js';
import nodemailer from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  debug: process.env.NODE_ENV !== 'production',
});


export const validatePayment = [
    check('email').notEmpty().withMessage('Email is required.').isEmail().withMessage('Please provide a valid email address.').trim().escape(),
    check('dollar_amount').notEmpty().withMessage('Dollar Amount is required').trim().escape(),
    check('rate').notEmpty().withMessage('Rate is required').trim().escape(),
    check('amount').notEmpty().withMessage('Amount is required').trim().escape(),
    check('payment_type').notEmpty().withMessage('Payment type is required').trim().escape(),
    check('paymentStatus').notEmpty().withMessage('Payment status is required').trim().escape(),
    check('phoneNumber').notEmpty().withMessage('Phone number is required').trim().escape(),
    check('transactionId').notEmpty().withMessage('Transaction ID is required').trim().escape(),
    check('userId').notEmpty().withMessage('User ID is required').trim().escape(),
];


const sendPaymentEmail = async (to, dollar_amount, rate, amount, payment_type, paymentStatus, paymentDuration, paymentDate, phoneNumber, transactionId, fullname) => {
  const mailOptions = {
    from: '"Mahjong Nigeria Clinic" <' + process.env.SMTP_USER + '>',
    to,
    subject: 'Payment Confirmation',
    html: paymentConfirmationTemplate(dollar_amount, rate, amount, payment_type, paymentStatus, paymentDuration, paymentDate, phoneNumber, transactionId, fullname),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Payment Confirmation email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return false;
  }
};

export const createPayment = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const { userId, email, dollar_amount, rate, amount, payment_type, phoneNumber, paymentDuration, transactionId, fullname, paymentMethod, transactionReference, currency } = req.body;
      const sanitizedEmail = email.trim().toLowerCase();
      const paymentStatus = 'Pending'; // Default status before confirmation
      const paymentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const createdBy = sanitizedEmail;
      const updatedBy = sanitizedEmail;
  
      // Check if user exists
      const checkUserQuery = 'SELECT id FROM users WHERE id = ? AND email = ?';
      db.query(checkUserQuery, [userId, sanitizedEmail], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (results.length === 0) return res.status(400).json({ message: 'User not found' });
  
        // Insert payment details
        const insertPaymentQuery = `INSERT INTO user_payment 
          (userId, email, dollar_amount, rate, amount, payment_type, paymentStatus, paymentDuration, paymentDate, phoneNumber, transactionId, fullname, createdBy, updatedBy, paymentMethod, transactionReference, currency) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const updateUserQuery = `UPDATE users SET membershipPayment = ?, membershipPaymentAmount = ?, membershipPaymentDate = ?, membershipPaymentDuration = ? WHERE id = ?`;
  
        db.query(
          insertPaymentQuery,
          [userId, sanitizedEmail, dollar_amount, rate, amount, payment_type, paymentStatus, paymentDuration, paymentDate, phoneNumber, transactionId, fullname, createdBy, updatedBy, paymentMethod, transactionReference, currency],
          async (err, result) => {
            if (err) return res.status(500).json({ message: 'Error creating payment', error: err });


            // Update user membership details
            db.query(
              updateUserQuery,
              [paymentStatus, amount, paymentDate, paymentDuration, userId],
              (err, updateResult) => {
                if (err) {
                  console.error('Error updating user membership:', err);
                  return res.status(500).json({ message: 'Error updating membership details', error: err });
                }
              }
            );
  
            // Send payment email
            const emailSent = await sendPaymentEmail(
              sanitizedEmail,
              dollar_amount,
              rate,
              amount,
              payment_type,
              paymentStatus,
              paymentDuration,
              paymentDate,
              phoneNumber,
              transactionId,
              fullname
            );
  
            res.status(200).json({
              message: emailSent
                ? 'Payment recorded successfully, email sent!'
                : 'Payment recorded successfully, but email failed to send.',
              data: {
                paymentId: result.insertId,
                userId,
                email: sanitizedEmail,
                dollar_amount,
                rate,
                amount,
                payment_type,
                paymentStatus,
                paymentDuration,
                paymentDate,
                phoneNumber,
                transactionId,
                fullname,
                createdBy,
                updatedBy,
                paymentMethod, 
                transactionReference, 
                currency
              }
            });
          }
        );
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };




// export const markNotificationAsRead = (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ status: 'Failed', errors: errors.array() });
//   }

//   const { userId, notificationId } = req.body;

//   const query = `
//     UPDATE user_notifications 
//     SET isRead = true 
//     WHERE userId = ? AND notificationId = ?
//   `;

//   db.query(query, [userId, notificationId], (err, result) => {
//     if (err) {
//       return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
//     }

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ status: 'Failed', message: "Sorry, this action could not be completed, there's no match found" });
//     }

//     res.status(200).json({ status: 'Successful', message: 'Notification marked as read' });
//   });
// };
