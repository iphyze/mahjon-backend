import db from '../../config/db.js';
import dotenv from 'dotenv';
import { check, validationResult } from 'express-validator';
import axios from 'axios';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';


dotenv.config();


// Validation rules for sending notifications
export const validateNotification = [
  check('userId').notEmpty().withMessage('User ID is required').isString().withMessage('User ID must be a string').trim().escape(),
  check('title').notEmpty().withMessage('Title is required').isString().withMessage('Title must be a string').trim().escape(),
  check('message').notEmpty().withMessage('Message is required').isString().withMessage('Message must be a string').trim().escape(),
  check('createdBy').notEmpty().withMessage('Created by is required').trim().escape(),
  check('updatedBy').notEmpty().withMessage('Updated by is required').trim().escape(),
];

export const validateUserIdNotification = [
  check('userId').notEmpty().withMessage('User ID is required').isString().withMessage('User ID must be a string').trim().escape(),
];

export const validateMarkNotification = [
  check('userId').notEmpty().withMessage('User ID is required').isString().withMessage('User ID must be a string').trim().escape(),
  check('notificationId').notEmpty().withMessage('Notification ID is required').isString().withMessage('Notification ID must be a string').trim().escape(),
];

export const getAllUsers = (req, res) => {
  const getUsersQuery = 'SELECT * FROM users';

  db.query(getUsersQuery, (err, results) => {
    if (err) {
      // console.error('Database error:', err);
      // return res.status(500).json({ message: 'Database error', error: err });

      console.error('Database error details:', {
        message: err.message,
        code: err.code,
        errno: err.errno,
        sqlState: err.sqlState
      });
      return res.status(500).json({ 
        message: 'Database error', 
        error: err.message,
        code: err.code 
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    // Map through the results to return the desired structure
    const users = results.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userName: user.userName,
      image: user.image,
      skillLevel: user.skillLevel,
      isEmailVerified: user.isEmailVerified,
      emailVerification: { emailCode: user.emailCode, expiresAt: user.expiresAt },
      payments: 
        {
          membership: {
            membershipPayment: results[0].membershipPayment,
            membershipPaymentAmount: results[0].membershipPaymentAmount,
            membershipPaymentDate: results[0].membershipPaymentDate,
            membershipPaymentDuration: results[0].membershipPaymentDuration,
          },
          tutorship: {
            tutorshipPayment: results[0].tutorshipPayment,
            tutorshipPaymentAmount: results[0].tutorshipPaymentAmount,
            tutorshipPaymentDate: results[0].tutorshipPaymentDate,
            tutorshipPaymentDuration: results[0].tutorshipPaymentDuration,
          }
        },
      role: user.role,
      country_code: user.country_code,
      number: user.number,
      createdAt: user.createdAt,
      updatedBy: user.updatedBy,
    }));

    res.status(200).json({
      message: 'Users retrieved successfully',
      data: users,
    });
  });
};


// Fetch individual user by ID
export const getUserById = (req, res) => {
    const { id } = req.params; // Extract ID from request parameters
    // const loggedInUserId = req.user.id;
    // const loggedInUserRole = req.user.role;

    // console.log(loggedInUserRole);

    // // Prevent access if the logged-in user is not the owner of the data
    // if (loggedInUserRole !== "Admin" && parseInt(id) !== parseInt(loggedInUserId)) {
    //   return res.status(403).json({ message: "Access denied. You can only view your own pairings." });
    // }

    const getUserQuery = 'SELECT * FROM users WHERE id = ?';
  
    db.query(getUserQuery, [id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Extract the user from results and format the response
      const user = {
        id: results[0].id,
        firstName: results[0].firstName,
        lastName: results[0].lastName,
        email: results[0].email,
        userName: results[0].userName,
        image: results[0].image,
        skillLevel: results[0].skillLevel,
        isEmailVerified: results[0].isEmailVerified,
        emailVerification: { emailCode: results[0].emailCode, expiresAt: results[0].expiresAt },
        payments: 
        {
          membership: {
            membershipPayment: results[0].membershipPayment,
            membershipPaymentAmount: results[0].membershipPaymentAmount,
            membershipPaymentDate: results[0].membershipPaymentDate,
            membershipPaymentDuration: results[0].membershipPaymentDuration,
          },
          tutorship: {
            tutorshipPayment: results[0].tutorshipPayment,
            tutorshipPaymentAmount: results[0].tutorshipPaymentAmount,
            tutorshipPaymentDate: results[0].tutorshipPaymentDate,
            tutorshipPaymentDuration: results[0].tutorshipPaymentDuration,
          }
        },
        role: results[0].role,
        country_code: results[0].country_code,
        number: results[0].number,
        createdAt: results[0].createdAt,
        updatedBy: results[0].updatedBy,
      };
  
      res.status(200).json({
        message: 'User retrieved successfully',
        data: user,
      });
    });
};
  


  export const deleteUsers = (req, res) => {
    const { userIds } = req.body; // Expecting an array of user IDs in the request body
  
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of user IDs to delete.' });
    }
  
    const deleteUsersQuery = `DELETE FROM users WHERE id IN (?)`;
  
    db.query(deleteUsersQuery, [userIds], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'No users found with the provided IDs.' });
      }
  
      res.status(200).json({
        message: 'User(s) deleted successfully',
        deletedCount: result.affectedRows,
      });
    });
  };
  


  export const updateUserDetails = (req, res) => {
    const { id } = req.params; // Extract user ID from the request parameters
    const { firstName, lastName, email, country_code, number } = req.body; // Extract fields to be updated
  
    // Check if at least one field is provided for update
    if (!firstName && !lastName && !email && !country_code && !number) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }
  
    // Validate email and number uniqueness
    const checkQuery = `
      SELECT * FROM users 
      WHERE (email = ? OR (number = ? AND country_code = ?)) AND id != ?
    `;
    db.query(checkQuery, [email, number, country_code, id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }
  
      // Check if email or number with the same country_code is already taken by another user
      if (results.length > 0) {
        const takenFields = [];
        if (results.some((user) => user.email === email)) {
          takenFields.push('email');
        }
        if (results.some((user) => user.number === number && user.country_code === country_code)) {
          takenFields.push('number');
        }
        return res.status(400).json({ message: `Numeber already taken by another user.` });
      }
  
      // Prepare update fields and values dynamically
      const updateFields = [];
      const updateValues = [];
  
      if (firstName) {
        updateFields.push('firstName = ?');
        updateValues.push(firstName);
      }
      if (lastName) {
        updateFields.push('lastName = ?');
        updateValues.push(lastName);
      }
      if (email) {
        updateFields.push('email = ?');
        updateValues.push(email);
      }
      if (country_code) {
        updateFields.push('country_code = ?');
        updateValues.push(country_code);
      }
      if (number) {
        updateFields.push('number = ?');
        updateValues.push(number);
      }
  
      updateValues.push(id); // Add ID to the update values
  
      const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
  
      db.query(updateQuery, updateValues, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Database error', error: err });
        }
  
        // Retrieve the updated user data
        const getUserQuery = `SELECT * FROM users WHERE id = ?`;
        db.query(getUserQuery, [id], (err, results) => {
          if (err) {
            return res.status(500).json({ message: 'Database error', error: err });
          }
  
          if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
          }
  
          const user = {
            id: results[0].id,
            firstName: results[0].firstName,
            lastName: results[0].lastName,
            userName: results[0].userName,
            email: results[0].email,
            isEmailVerified: results[0].isEmailVerified,
            emailVerification: {
              emailCode: results[0].emailCode,
              expiresAt: results[0].expiresAt,
            },
            role: results[0].role,
            country_code: results[0].country_code,
            number: results[0].number,
            createdAt: results[0].createdAt,
            updatedBy: results[0].updatedBy,
          };
  
          res.status(200).json({
            message: 'User details updated successfully',
            data: user,
          });
        });
      });
    });
  };




  // Function to send a notification
export const sendNotification = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'Failed', errors: errors.array() });
    }

    let { userId, title, message, createdBy, updatedBy } = req.body;
    const isForAllUsers = userId.toLowerCase() === 'all';

    if (!isForAllUsers) {
        // Check if the user exists before proceeding
        const checkUserQuery = `SELECT id FROM users WHERE id = ?`;
        db.query(checkUserQuery, [userId], (err, userResult) => {
            if (err) {
                return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
            }
            
            if (userResult.length === 0) {
                return res.status(404).json({ status: 'Failed', message: 'User not found' });
            }

            // Proceed to insert notification since the user exists
            insertNotification(userId, title, message, res);
        });
    } else {
        // If for all users, insert directly
        insertNotification('All', title, message, res);
    }
};


// const sendPushNotification = async (expoPushToken, title, message) => {
//   if (!expoPushToken) return;

//   try {
//     await axios.post('https://exp.host/--/api/v2/push/send', {
//       to: expoPushToken,
//       sound: 'default',
//       title,
//       body: message,
//     }, {
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       }
//     });
//     return true;
//   } catch (error) {
//     console.error('Error sending push notification:', error);
//     return false;
//   }
// };


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



// const insertNotification = (userId, title, message, res) => {
//   const insertQuery = `
//       INSERT INTO notifications (userId, title, message, createdBy, updatedBy)
//       VALUES (?, ?, ?, ?, ?)
//   `;
//   const values = [userId, title, message, 'Admin', 'Admin'];

//   db.query(insertQuery, values, (err, result) => {
//       if (err) {
//           console.error('Database error inserting notification:', err);
//           return res.status(500).json({ status: 'Failed', message: 'Database error', error: err.message });
//       }

//       const notificationId = result.insertId;
      
//       // Track push notification results
//       let pushSuccessCount = 0;
//       let pushFailureCount = 0;

//       if (userId === 'All') {
//           db.query('SELECT id, expoPushToken FROM users', async (err, users) => {
//               if (err) {
//                   console.error('Database error fetching users:', err);
//                   return res.status(500).json({ status: 'Failed', message: 'Database error', error: err.message });
//               }

//               const userNotifications = users.map(user => [notificationId, user.id, false]);

//               if (userNotifications.length > 0) {
//                   db.query('INSERT INTO user_notifications (notificationId, userId, isRead) VALUES ?', [userNotifications], (err) => {
//                       if (err) {
//                           console.error('Error inserting user notifications:', err);
//                       }
//                   });
                  
//                   // Send push notifications only to users who have enabled them
//                   console.log(`Attempting to send notifications to ${users.length} users`);
                  
//                   const pushPromises = users
//                       .filter(user => user.expoPushToken && user.notificationsEnabled !== false)
//                       .map(async (user) => {
//                           console.log(`Sending to user ${user.id} with token: ${user.expoPushToken}`);
//                           const success = await sendPushNotification(user.expoPushToken, title, message);
//                           if (success) pushSuccessCount++;
//                           else pushFailureCount++;
//                           return success;
//                       });
                  
//                   await Promise.all(pushPromises);
//                   console.log(`Push notification results: ${pushSuccessCount} successful, ${pushFailureCount} failed`);
//               }
              
//               res.status(200).json({
//                   status: 'Successful',
//                   message: 'Notification has been sent successfully',
//                   data: { 
//                       id: notificationId, 
//                       userId, 
//                       title, 
//                       message,
//                       pushStats: {
//                           attempted: users.filter(u => u.expoPushToken).length,
//                           successful: pushSuccessCount,
//                           failed: pushFailureCount
//                       }
//                   },
//               });
//           });
//       } else {
//           db.query('SELECT expoPushToken FROM users WHERE id = ?', [userId], async (err, result) => {
//               if (err) {
//                   console.error('Database error fetching user token:', err);
//                   return res.status(500).json({ status: 'Failed', message: 'Database error', error: err.message });
//               }

//               let pushResult = false;
//               if (result.length > 0 && result[0].expoPushToken && result[0].notificationsEnabled !== false) {
//                   console.log(`Sending to single user with token: ${result[0].expoPushToken}`);
//                   pushResult = await sendPushNotification(result[0].expoPushToken, title, message);
//                   pushSuccessCount = pushResult ? 1 : 0;
//                   pushFailureCount = pushResult ? 0 : 1;
//               }

//               db.query('INSERT INTO user_notifications (notificationId, userId, isRead) VALUES (?, ?, ?)', 
//                   [notificationId, userId, false], 
//                   (err) => {
//                       if (err) {
//                           console.error('Error inserting user notification:', err);
//                       }
//                   }
//               );

//               res.status(200).json({
//                   status: 'Successful',
//                   message: 'Notification has been sent successfully',
//                   data: { 
//                       id: notificationId, 
//                       userId, 
//                       title, 
//                       message,
//                       pushStats: {
//                           attempted: result.length > 0 && result[0].expoPushToken ? 1 : 0,
//                           successful: pushSuccessCount,
//                           failed: pushFailureCount
//                       }
//                   },
//               });
//           });
//       }
//   });
// };


const insertNotification = (userId, title, message, res) => {
  const insertQuery = `
      INSERT INTO notifications (userId, title, message, createdBy, updatedBy)
      VALUES (?, ?, ?, ?, ?)
  `;
  const values = [userId, title, message, 'Admin', 'Admin'];

  db.query(insertQuery, values, (err, result) => {
      if (err) {
          console.error('Database error inserting notification:', err);
          return res.status(500).json({ status: 'Failed', message: 'Database error', error: err.message });
      }

      const notificationId = result.insertId;
      
      // Track push notification results
      let pushSuccessCount = 0;
      let pushFailureCount = 0;

      if (userId === 'All') {
          db.query('SELECT id, expoPushToken FROM users', async (err, users) => {
              if (err) {
                  console.error('Database error fetching users:', err);
                  return res.status(500).json({ status: 'Failed', message: 'Database error', error: err.message });
              }

              const userNotifications = users.map(user => [notificationId, user.id, false]);

              if (userNotifications.length > 0) {
                  db.query('INSERT INTO user_notifications (notificationId, userId, isRead) VALUES ?', [userNotifications], (err) => {
                      if (err) {
                          console.error('Error inserting user notifications:', err);
                      }
                  });
                  
                  // Send push notifications to all users with valid tokens
                  console.log(`Attempting to send notifications to ${users.length} users`);
                  
                  const pushPromises = users
                      .filter(user => user.expoPushToken)
                      .map(async (user) => {
                          console.log(`Sending to user ${user.id} with token: ${user.expoPushToken}`);
                          const success = await sendPushNotification(user.expoPushToken, title, message);
                          if (success) pushSuccessCount++;
                          else pushFailureCount++;
                          return success;
                      });
                  
                  await Promise.all(pushPromises);
                  console.log(`Push notification results: ${pushSuccessCount} successful, ${pushFailureCount} failed`);
              }
              
              res.status(200).json({
                  status: 'Successful',
                  message: 'Notification has been sent successfully',
                  data: { 
                      id: notificationId, 
                      userId, 
                      title, 
                      message,
                      pushStats: {
                          attempted: users.filter(u => u.expoPushToken).length,
                          successful: pushSuccessCount,
                          failed: pushFailureCount
                      }
                  },
              });
          });
      } else {
          db.query('SELECT expoPushToken FROM users WHERE id = ?', [userId], async (err, result) => {
              if (err) {
                  console.error('Database error fetching user token:', err);
                  return res.status(500).json({ status: 'Failed', message: 'Database error', error: err.message });
              }

              let pushResult = false;
              if (result.length > 0 && result[0].expoPushToken) {
                  console.log(`Sending to single user with token: ${result[0].expoPushToken}`);
                  pushResult = await sendPushNotification(result[0].expoPushToken, title, message);
                  pushSuccessCount = pushResult ? 1 : 0;
                  pushFailureCount = pushResult ? 0 : 1;
              }

              db.query('INSERT INTO user_notifications (notificationId, userId, isRead) VALUES (?, ?, ?)', 
                  [notificationId, userId, false], 
                  (err) => {
                      if (err) {
                          console.error('Error inserting user notification:', err);
                      }
                  }
              );

              res.status(200).json({
                  status: 'Successful',
                  message: 'Notification has been sent successfully',
                  data: { 
                      id: notificationId, 
                      userId, 
                      title, 
                      message,
                      pushStats: {
                          attempted: result.length > 0 && result[0].expoPushToken ? 1 : 0,
                          successful: pushSuccessCount,
                          failed: pushFailureCount
                      }
                  },
              });
          });
      }
  });
};



export const getUserNotifications = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'Failed', errors: errors.array() });
  }

  const { userId } = req.params;

  // Check if the user exists and get registration date
  const userCheckQuery = `SELECT id, createdAt as registrationDate FROM users WHERE id = ?`;

  db.query(userCheckQuery, [userId], (err, userResult) => {
    if (err) {
      return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
    }

    if (userResult.length === 0) {
      return res.status(404).json({ status: 'Failed', message: 'User not found' });
    }

    const registrationDate = userResult[0].registrationDate;

    // Modified query to include registration date check for 'All' notifications
    const query = `
      SELECT 
        n.id AS notificationId, 
        n.title, 
        n.message, 
        n.createdAt, 
        n.userId AS notificationUserId,
        COALESCE(un.isRead, false) AS isRead
      FROM notifications n
      LEFT JOIN user_notifications un ON n.id = un.notificationId AND un.userId = ?
      WHERE 
        (n.userId = ? OR 
        (n.userId = 'All' AND n.createdAt >= ?))
      ORDER BY n.createdAt DESC
    `;

    db.query(query, [userId, userId, registrationDate], (err, results) => {
      if (err) {
        return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
      }

      res.status(200).json({
        status: 'Successful',
        data: results,
      });
    });
  });
};



// const insertNotification = (userId, title, message, res) => {
//   const insertQuery = `
//       INSERT INTO notifications (userId, title, message, createdBy, updatedBy)
//       VALUES (?, ?, ?, ?, ?)
//   `;
//   const values = [userId, title, message, 'Admin', 'Admin'];

//   db.query(insertQuery, values, (err, result) => {
//       if (err) {
//           return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
//       }

//       const notificationId = result.insertId;

//       if (userId === 'All') {
//           db.query('SELECT id, expoPushToken FROM users', async (err, users) => {
//               if (err) {
//                   return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
//               }

//               const userNotifications = users.map(user => [notificationId, user.id, false]);

//               if (userNotifications.length > 0) {
//                   db.query('INSERT INTO user_notifications (notificationId, userId, isRead) VALUES ?', [userNotifications]);
                  
//                   // Send push notifications to all users
//                   users.forEach(user => {
//                       if (user.expoPushToken) {
//                           sendPushNotification(user.expoPushToken, title, message);
//                       }
//                   });
//               }
//           });
//       } else {
//           db.query('SELECT expoPushToken FROM users WHERE id = ?', [userId], async (err, result) => {
//               if (err) {
//                   return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
//               }

//               if (result.length > 0) {
//                   sendPushNotification(result[0].expoPushToken, title, message);
//               }
//           });

//           db.query('INSERT INTO user_notifications (notificationId, userId, isRead) VALUES (?, ?, ?)', [notificationId, userId, false]);
//       }

//       res.status(200).json({
//           status: 'Successful',
//           message: 'Notification has been sent successfully',
//           data: { id: notificationId, userId, title, message },
//       });
//   });
// };



// Separate function to insert notification
// const insertNotification = (userId, title, message, res) => {
//     const insertQuery = `
//         INSERT INTO notifications (userId, title, message, createdBy, updatedBy)
//         VALUES (?, ?, ?, ?, ?)
//     `;
//     const values = [userId, title, message, 'Admin', 'Admin'];

//     db.query(insertQuery, values, (err, result) => {
//         if (err) {
//             return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
//         }

//         const notificationId = result.insertId;

//         // If sending to all, insert for every user
//         if (userId === 'All') {
//             db.query('SELECT id FROM users', (err, users) => {
//                 if (err) {
//                     return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
//                 }

//                 const userNotifications = users.map(user => [notificationId, user.id, false]);
//                 if (userNotifications.length > 0) {
//                     db.query('INSERT INTO user_notifications (notificationId, userId, isRead) VALUES ?', [userNotifications]);
//                 }
//             });
//         } else {
//             db.query('INSERT INTO user_notifications (notificationId, userId, isRead) VALUES (?, ?, ?)', [notificationId, userId, false]);
//         }

//         res.status(200).json({
//             status: 'Successful',
//             message: 'Notification has been sent successfully',
//             data: { id: notificationId, userId, title, message },
//         });
//     });
// };
  


// export const getUserNotifications = (req, res) => {
//   const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ status: 'Failed', errors: errors.array() });
//     }

//   const { userId } = req.params;

//   // Check if the user exists
//   const userCheckQuery = `SELECT id FROM users WHERE id = ?`;

//   db.query(userCheckQuery, [userId], (err, userResult) => {
//     if (err) {
//       return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
//     }

//     if (userResult.length === 0) {
//       return res.status(404).json({ status: 'Failed', message: 'User not found' });
//     }

//     // Fetch notifications if user exists
//     const query = `
//       SELECT 
//         n.id AS notificationId, 
//         n.title, 
//         n.message, 
//         n.createdAt, 
//         COALESCE(un.isRead, false) AS isRead
//       FROM notifications n
//       LEFT JOIN user_notifications un ON n.id = un.notificationId AND un.userId = ?
//       WHERE n.userId = 'All' OR n.userId = ?
//       ORDER BY n.createdAt DESC
//     `;

//     db.query(query, [userId, userId], (err, results) => {
//       if (err) {
//         return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
//       }

//       res.status(200).json({
//         status: 'Successful',
//         data: results,
//       });
//     });
//   });
// };



export const markNotificationAsRead = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'Failed', errors: errors.array() });
  }

  const { userId, notificationId } = req.body;

  const query = `
    UPDATE user_notifications 
    SET isRead = true 
    WHERE userId = ? AND notificationId = ?
  `;

  db.query(query, [userId, notificationId], (err, result) => {
    if (err) {
      return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'Failed', message: "Sorry, this action could not be completed, there's no match found" });
    }

    res.status(200).json({ status: 'Successful', message: 'Notification marked as read' });
  });
};



export const updatePushToken = (req, res) => {

  const { userId, expoPushToken } = req.body;

    if (!userId || !expoPushToken) {
        return res.status(400).json({ status: 'Failed', message: 'Missing userId or expoPushToken' });
    }

    const query = `UPDATE users SET expoPushToken = ? WHERE id = ?`;
    db.query(query, [expoPushToken, userId], (err) => {
        if (err) {
            return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
        }
        res.json({ status: 'Success', message: 'Push token saved successfully' });
    });
};


// Keep this path since it matches your working upload location
const UPLOAD_PATH = './imageUploads/mahjong-uploads/';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_PATH)) {
    fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_PATH);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        let baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_'); // Remove spaces

        // Ensure uniqueness using timestamp
        const timestamp = Date.now();
        const uniqueFilename = `${baseName}_${timestamp}${ext}`;
        
        cb(null, uniqueFilename);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, JPG, PNG, WEBP, and AVIF files are allowed!'), false);
    }
};

// Multer upload settings (max size 2MB)
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
}).single('image');

// Update User Function
export const updateUser = (req, res) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: 'File upload error: ' + err.message });
        } else if (err) {
            return res.status(500).json({ message: 'Server error: ' + err.message });
        }

        const { userId } = req.params;
        const { firstName, lastName } = req.body;
        let imageUrl = null;

        if (req.file) {
            imageUrl = `https://mahjong-db.goldenrootscollectionsltd.com/imageUploads/mahjong-uploads/${req.file.filename}`;
        }

        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (req.file) updateData.image = req.file.filename;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "At least one field must be updated." });
        }

        // Update user in the database
        db.query('UPDATE users SET ? WHERE id = ?', [updateData, userId], (err, result) => {
            if (err) {
                console.error('Update error:', err);
                return res.status(500).json({ message: 'Error updating profile' });
            }

            if (result.affectedRows > 0) {
                return res.status(200).json({
                    message: 'Profile updated successfully',
                    user: {
                        ...updateData,
                        image: imageUrl || null
                    }
                });
            } else {
                return res.status(404).json({ message: 'User not found' });
            }
        });
    });
};


// export const updateUser = (req, res) => {
//   upload(req, res, (err) => {
//       if (err instanceof multer.MulterError) {
//           return res.status(400).json({ message: "File upload error: " + err.message });
//       } else if (err) {
//           return res.status(500).json({ message: "Server error: " + err.message });
//       }

//       const { userId } = req.params;
//       const { firstName, lastName } = req.body;
//       let newImageFilename = null;

//       // Check if an image was uploaded
//       if (req.file) {
//           const ext = path.extname(req.file.originalname);
//           newImageFilename = `user_${Date.now()}${ext}`;
//           fs.renameSync(req.file.path, path.join(UPLOAD_DIR, newImageFilename));
//       }

//       // Construct update data object
//       const updateData = {};
//       if (firstName) updateData.firstName = firstName;
//       if (lastName) updateData.lastName = lastName;
//       if (newImageFilename) updateData.image = newImageFilename;

//       // If no updates, return "No changes made!"
//       if (Object.keys(updateData).length === 0) {
//           return res.status(400).json({ message: "No changes made!" });
//       }

//       // Update database
//       db.query("UPDATE users SET ? WHERE id = ?", [updateData, userId], (err, result) => {
//           if (err) {
//               console.error("Update error:", err);
//               return res.status(500).json({ message: "Error updating profile" });
//           }

//           if (result.affectedRows > 0) {
//               return res.status(200).json({
//                   message: "Profile updated successfully",
//                   user: {
//                       ...updateData,
//                       image: newImageFilename
//                           ? `https://mahjong-db.goldenrootscollectionsltd.com/imageUploads/mahjong-uploads/${newImageFilename}`
//                           : null,
//                   },
//               });
//           } else {
//               return res.status(404).json({ message: "User not found" });
//           }
//       });
//   });
// };
