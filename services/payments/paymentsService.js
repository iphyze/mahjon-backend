import db from '../../config/db.js';
import dotenv from 'dotenv';
import { check, validationResult } from 'express-validator';
import { paymentConfirmationTemplate } from '../../utils/paymentEmailTemplates.js';
import nodemailer from 'nodemailer';
import axios from 'axios';

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


// export const createPayment = async (req, res) => {
//     // Check for validation errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
  
//     try {
//       const { userId, email, dollar_amount, rate, amount, payment_type, phoneNumber, paymentDuration, transactionId, fullname, paymentMethod, transactionReference, currency, paymentStatus } = req.body;
//       const sanitizedEmail = email.trim().toLowerCase();
//       const paymentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
//       const createdBy = sanitizedEmail;
//       const updatedBy = sanitizedEmail;
  
//       // Check if user exists
//       const checkUserQuery = 'SELECT id FROM users WHERE id = ? AND email = ?';
//       db.query(checkUserQuery, [userId, sanitizedEmail], (err, results) => {
//         if (err) return res.status(500).json({ message: 'Database error', error: err });
//         if (results.length === 0) return res.status(400).json({ message: 'User not found' });
  
//         // Insert payment details
//         const insertPaymentQuery = `INSERT INTO user_payment 
//           (userId, email, dollar_amount, rate, amount, payment_type, paymentStatus, paymentDuration, paymentDate, phoneNumber, transactionId, fullname, createdBy, updatedBy, paymentMethod, transactionReference, currency) 
//           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;


//         // if(payment_type === 'Membership Payment'){
//         //   const updateUserQuery = `UPDATE users SET membershipPayment = ?, membershipPaymentAmount = ?, membershipPaymentDate = ?, membershipPaymentDuration = ? WHERE id = ?`;
//         // }else if(payment_type === 'Tutorship Payment'){
//         //   const updateUserQuery = `UPDATE users SET tutorshipPayment = ?, tutorshipPaymentAmount = ?, tutorshipPaymentDate = ?, tutorshipPaymentDuration = ? WHERE id = ?`;
//         // }

//         const updateUserQuery = payment_type === 'Membership Payment' ? `UPDATE users SET membershipPayment = ?, membershipPaymentAmount = ?, membershipPaymentDate = ?, membershipPaymentDuration = ? WHERE id = ?` :
//         payment_type === 'Tutorship Payment' ? `UPDATE users SET tutorshipPayment = ?, tutorshipPaymentAmount = ?, tutorshipPaymentDate = ?, tutorshipPaymentDuration = ? WHERE id = ?` : null;

  
//         db.query(
//           insertPaymentQuery,
//           [userId, sanitizedEmail, dollar_amount, rate, amount, payment_type, paymentStatus, paymentDuration, paymentDate, phoneNumber, transactionId, fullname, createdBy, updatedBy, paymentMethod, transactionReference, currency],
//           async (err, result) => {
//             if (err) return res.status(500).json({ message: 'Error creating payment', error: err });


//             // Update user membership details
//             db.query(
//               updateUserQuery,
//               [paymentStatus, amount, paymentDate, paymentDuration, userId],
//               (err, updateResult) => {
//                 if (err) {
//                   console.error('Error updating user membership:', err);
//                   return res.status(500).json({ message: 'Error updating membership details', error: err });
//                 }
//               }
//             );
  
//             // Send payment email
//             const emailSent = await sendPaymentEmail(
//               sanitizedEmail,
//               dollar_amount,
//               rate,
//               amount,
//               payment_type,
//               paymentStatus,
//               paymentDuration,
//               paymentDate,
//               phoneNumber,
//               transactionId,
//               fullname
//             );
  
//             res.status(200).json({
//               message: emailSent
//                 ? 'Payment recorded successfully, email sent!'
//                 : 'Payment recorded successfully, but email failed to send.',
//               data: {
//                 paymentId: result.insertId,
//                 userId,
//                 email: sanitizedEmail,
//                 dollar_amount,
//                 rate,
//                 amount,
//                 payment_type,
//                 paymentStatus,
//                 paymentDuration,
//                 paymentDate,
//                 phoneNumber,
//                 transactionId,
//                 fullname,
//                 createdBy,
//                 updatedBy,
//                 paymentMethod, 
//                 transactionReference, 
//                 currency
//               }
//             });
//           }
//         );
//       });
//     } catch (error) {
//       res.status(500).json({ message: 'Server error', error: error.message });
//     }
//   };


export const createPayment = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  try {
      const { 
          userId, email, dollar_amount, rate, amount, payment_type, phoneNumber, 
          paymentDuration, transactionId, fullname, paymentMethod, transactionReference, 
          currency, paymentStatus 
      } = req.body;

      const sanitizedEmail = email.trim().toLowerCase();
      const paymentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const createdBy = sanitizedEmail;
      const updatedBy = sanitizedEmail;

      // Check if user exists and get their push token
      const checkUserQuery = 'SELECT id, expoPushToken FROM users WHERE id = ? AND email = ?';
      db.query(checkUserQuery, [userId, sanitizedEmail], async (err, results) => {
          if (err) return res.status(500).json({ message: 'Database error', error: err });
          if (results.length === 0) return res.status(400).json({ message: 'User not found' });

          const expoPushToken = results[0].expoPushToken; // Get user's push token

          // Insert payment details
          const insertPaymentQuery = `INSERT INTO user_payment 
              (userId, email, dollar_amount, rate, amount, payment_type, paymentStatus, paymentDuration, 
              paymentDate, phoneNumber, transactionId, fullname, createdBy, updatedBy, paymentMethod, 
              transactionReference, currency) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

          const updateUserQuery = payment_type === 'Membership Payment' ? 
              `UPDATE users SET membershipPayment = ?, membershipPaymentAmount = ?, 
              membershipPaymentDate = ?, membershipPaymentDuration = ? WHERE id = ?` :
              payment_type === 'Tutorship Payment' ? 
              `UPDATE users SET tutorshipPayment = ?, tutorshipPaymentAmount = ?, 
              tutorshipPaymentDate = ?, tutorshipPaymentDuration = ? WHERE id = ?` : null;

          db.query(
              insertPaymentQuery,
              [userId, sanitizedEmail, dollar_amount, rate, amount, payment_type, paymentStatus, 
              paymentDuration, paymentDate, phoneNumber, transactionId, fullname, createdBy, 
              updatedBy, paymentMethod, transactionReference, currency],
              async (err, paymentResult) => {
                  if (err) return res.status(500).json({ message: 'Error creating payment', error: err });
                  
                  const paymentId = paymentResult.insertId;

                  // Skip the user update if no valid payment type
                  if (!updateUserQuery) {
                      // Process other steps (notification, email) and send response
                      return processPaymentCompletion(
                          userId, sanitizedEmail, dollar_amount, rate, amount, payment_type, 
                          paymentStatus, paymentDuration, paymentDate, phoneNumber, transactionId, 
                          fullname, createdBy, updatedBy, paymentMethod, transactionReference, 
                          currency, paymentId, expoPushToken, res
                      );
                  }

                  // Update user membership/tutorship details if needed
                  db.query(
                      updateUserQuery,
                      [paymentStatus, amount, paymentDate, paymentDuration, userId],
                      async (err) => {
                          if (err) {
                              console.error('Error updating user details:', err);
                              return res.status(500).json({ 
                                  message: `Error updating ${payment_type.toLowerCase()} details`, 
                                  error: err 
                              });
                          }

                          // Process other steps (notification, email) and send response
                          await processPaymentCompletion(
                              userId, sanitizedEmail, dollar_amount, rate, amount, payment_type, 
                              paymentStatus, paymentDuration, paymentDate, phoneNumber, transactionId, 
                              fullname, createdBy, updatedBy, paymentMethod, transactionReference, 
                              currency, paymentId, expoPushToken, res
                          );
                      }
                  );
              }
          );
      });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to process the final steps after payment is recorded
const processPaymentCompletion = async (
  userId, email, dollar_amount, rate, amount, payment_type, paymentStatus,
  paymentDuration, paymentDate, phoneNumber, transactionId, fullname,
  createdBy, updatedBy, paymentMethod, transactionReference, currency,
  paymentId, expoPushToken, res
) => {
  try {
      let notificationSent = false;
      let notificationTitle = null;
      let notificationMessage = null;
      
      // Only send notification if payment was successful
      if (paymentStatus.toLowerCase() === 'successful') {
          // Prepare notification data
          if (payment_type === 'Membership Payment') {
              notificationTitle = 'Membership Payment Completed!';
              notificationMessage = `🎉 Congratulations ${fullname}! You are now an official member of Mahjong Clinic Nigeria. Welcome aboard! 🚀🔥`;
          } else if (payment_type === 'Tutorship Payment') {
              notificationTitle = 'Tutorship Payment Completed!';
              notificationMessage = `🎉 Congratulations ${fullname}! You are now a student at Mahjong Clinic Nigeria. Welcome aboard! 🚀🔥`;
          } else {
              notificationTitle = 'Payment Completed!';
              notificationMessage = `🎉 Thank you ${fullname}! Your payment of ${currency} ${amount} has been successfully processed.`;
          }
          
          // Store notification in database
          await storeNotification(userId, notificationTitle, notificationMessage, email);
          
          // Send push notification if token exists
          if (expoPushToken) {
              notificationSent = await sendPushNotification(expoPushToken, notificationTitle, notificationMessage);
          }
      }
      
      // Send payment email
      const emailSent = await sendPaymentEmail(
          email, dollar_amount, rate, amount, payment_type, paymentStatus,
          paymentDuration, paymentDate, phoneNumber, transactionId, fullname
      );
      
      // Send response
      return res.status(200).json({
          message: emailSent
              ? 'Payment recorded successfully, email sent!'
              : 'Payment recorded successfully, but email failed to send.',
          data: {
              paymentId,
              userId, 
              email, 
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
              currency,
              notification: paymentStatus.toLowerCase() === 'successful' ? {
                  sent: notificationSent,
                  title: notificationTitle,
                  message: notificationMessage
              } : null
          }
      });
  } catch (error) {
      console.error('Error in payment completion process:', error);
      return res.status(500).json({ 
          message: 'Payment recorded but there was an error with notification or email', 
          error: error.message 
      });
  }
};

// Store notification in database
const storeNotification = (userId, title, message, email) => {
  return new Promise((resolve, reject) => {
      const insertQuery = `
          INSERT INTO notifications (userId, title, message, createdBy, updatedBy)
          VALUES (?, ?, ?, ?, ?)
      `;
      const values = [userId, title, message, email, email];

      db.query(insertQuery, values, (err, result) => {
          if (err) {
              console.error('Database error inserting notification:', err);
              return reject(err);
          }

          const notificationId = result.insertId;

          // Insert into user_notifications table
          db.query(
              'INSERT INTO user_notifications (notificationId, userId, isRead) VALUES (?, ?, ?)', 
              [notificationId, userId, false], 
              (err) => {
                  if (err) {
                      console.error('Error inserting user notification:', err);
                      return reject(err);
                  }
                  resolve(notificationId);
              }
          );
      });
  });
};

const sendPushNotification = async (expoPushToken, title, message) => {
  if (!expoPushToken) {
      console.log('No push token provided, skipping notification');
      return false;
  }

  // Validate token format
  if (!expoPushToken.startsWith('ExponentPushToken[') && !expoPushToken.startsWith('ExpoPushToken[')) {
      console.error('Invalid token format:', expoPushToken);
      return false;
  }

  try {
      const notificationPayload = {
          to: expoPushToken,
          sound: 'default',
          title: title,
          body: message,
          data: { // Optional data for your app to process
              title: title,
              message: message,
              timestamp: new Date().toISOString()
          },
          priority: 'high', // Important for Android
          channelId: 'default', // Must match the channel ID you created in your app
          badge: 1, // For iOS
          _displayInForeground: true // To ensure it shows when app is in foreground
      };
      
      console.log('Sending push notification:', JSON.stringify(notificationPayload));
      
      const response = await axios.post(
          'https://exp.host/--/api/v2/push/send',
          notificationPayload,
          {
              headers: {
                  'Accept': 'application/json',
                  'Accept-encoding': 'gzip, deflate',
                  'Content-Type': 'application/json',
              }
          }
      );
      
      console.log('Push notification response:', response.data);
      return true;
  } catch (error) {
      console.error('Error sending push notification:', error);
      
      // Better error logging
      if (error.response) {
          console.error('Server responded with:', error.response.status, error.response.data);
      } else if (error.request) {
          console.error('No response received from server');
      } else {
          console.error('Error setting up request:', error.message);
      }
      
      return false;
  }
};

  

export const getAllPayments = async (req, res) => {
  try {
    const query = 'SELECT * FROM user_payment ORDER BY paymentDate DESC';
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      res.status(200).json({ message: 'Successfully fetched all payments', data: results });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


  
export const getSingleUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const query = 'SELECT * FROM user_payment WHERE userId = ? ORDER BY paymentDate DESC';
    db.query(query, [userId], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'Successfully fetched user payments', data: results });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


  