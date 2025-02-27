import db from '../../config/db.js';
import dotenv from 'dotenv';
import { check, validationResult } from 'express-validator';
// import { Expo } from 'expo-server-sdk';

dotenv.config();

// Initialize Expo SDK
// const expo = new Expo();


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
      token: token,
      isEmailVerified: user.isEmailVerified,
      emailVerification: { emailCode: user.emailCode, expiresAt: user.expiresAt },
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
        token: results[0].token,
        isEmailVerified: results[0].isEmailVerified,
        emailVerification: { emailCode: results[0].emailCode, expiresAt: results[0].expiresAt },
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

// Separate function to insert notification
const insertNotification = (userId, title, message, res) => {
    const insertQuery = `
        INSERT INTO notifications (userId, title, message, createdBy, updatedBy)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [userId, title, message, 'Admin', 'Admin'];

    db.query(insertQuery, values, (err, result) => {
        if (err) {
            return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
        }

        const notificationId = result.insertId;

        // If sending to all, insert for every user
        if (userId === 'All') {
            db.query('SELECT id FROM users', (err, users) => {
                if (err) {
                    return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
                }

                const userNotifications = users.map(user => [notificationId, user.id, false]);
                if (userNotifications.length > 0) {
                    db.query('INSERT INTO user_notifications (notificationId, userId, isRead) VALUES ?', [userNotifications]);
                }
            });
        } else {
            db.query('INSERT INTO user_notifications (notificationId, userId, isRead) VALUES (?, ?, ?)', [notificationId, userId, false]);
        }

        res.status(200).json({
            status: 'Successful',
            message: 'Notification has been sent successfully',
            data: { id: notificationId, userId, title, message },
        });
    });
};


// export const sendNotification = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ status: 'Failed', errors: errors.array() });
//     }

//     let { userId, title, message, createdBy, updatedBy } = req.body;
//     const isForAllUsers = userId.toLowerCase() === 'all';

//     if (!isForAllUsers) {
//         // Check if the user exists and get their push token
//         const checkUserQuery = `SELECT id, expoPushToken FROM users WHERE id = ?`;
//         db.query(checkUserQuery, [userId], (err, userResult) => {
//             if (err) {
//                 return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
//             }
            
//             if (userResult.length === 0) {
//                 return res.status(404).json({ status: 'Failed', message: 'User not found' });
//             }

//             // Proceed to insert notification since the user exists
//             insertNotification(userId, title, message, res, userResult[0].expoPushToken);
//         });
//     } else {
//         // If for all users, get all users' push tokens
//         db.query('SELECT id, expoPushToken FROM users WHERE expoPushToken IS NOT NULL', async (err, users) => {
//             if (err) {
//                 return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
//             }
//             // Insert notification for all users
//             insertNotification('All', title, message, res, users.map(user => user.expoPushToken));
//         });
//     }
// };

// // Function to send push notifications
// const sendPushNotification = async (pushTokens, title, message) => {
//     // Create the messages that you want to send to clients
//     let messages = [];
    
//     // If pushTokens is a single token, convert it to an array
//     const tokenArray = Array.isArray(pushTokens) ? pushTokens : [pushTokens];

//     for (let pushToken of tokenArray) {
//         // Check that all your push tokens appear to be valid Expo push tokens
//         if (!Expo.isExpoPushToken(pushToken)) {
//             console.error(`Push token ${pushToken} is not a valid Expo push token`);
//             continue;
//         }

//         // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
//         messages.push({
//             to: pushToken,
//             sound: 'default',
//             title: title,
//             body: message,
//             data: { withSome: 'data' },
//         });
//     }

//     // The Expo push notification service accepts batches of notifications so
//     // that you don't need to send 1000 requests to send 1000 notifications.
//     // However, there are limits on the number of notifications you can send at once.
//     let chunks = expo.chunkPushNotifications(messages);

//     try {
//         // Send the chunks to the Expo push notification service
//         let tickets = [];
//         for (let chunk of chunks) {
//             try {
//                 let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
//                 tickets.push(...ticketChunk);
//             } catch (error) {
//                 console.error('Error sending chunk:', error);
//             }
//         }
//         return tickets;
//     } catch (error) {
//         console.error('Error sending push notification:', error);
//         throw error;
//     }
// };

// // Modified insertNotification function
// const insertNotification = async (userId, title, message, res, pushTokens) => {
//     const insertQuery = `
//         INSERT INTO notifications (userId, title, message, createdBy, updatedBy)
//         VALUES (?, ?, ?, ?, ?)
//     `;
//     const values = [userId, title, message, 'Admin', 'Admin'];

//     db.query(insertQuery, values, async (err, result) => {
//         if (err) {
//             return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
//         }

//         const notificationId = result.insertId;

//         try {
//             // Send push notification
//             if (pushTokens) {
//                 await sendPushNotification(pushTokens, title, message);
//             }

//             // If sending to all, insert for every user
//             if (userId === 'All') {
//                 db.query('SELECT id FROM users', (err, users) => {
//                     if (err) {
//                         return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
//                     }

//                     const userNotifications = users.map(user => [notificationId, user.id, false]);
//                     if (userNotifications.length > 0) {
//                         db.query('INSERT INTO user_notifications (notificationId, userId, isRead) VALUES ?', [userNotifications]);
//                     }
//                 });
//             } else {
//                 db.query('INSERT INTO user_notifications (notificationId, userId, isRead) VALUES (?, ?, ?)', [notificationId, userId, false]);
//             }

//             res.status(200).json({
//                 status: 'Successful',
//                 message: 'Notification has been sent successfully',
//                 data: { id: notificationId, userId, title, message },
//             });
//         } catch (error) {
//             console.error('Error in push notification:', error);
//             // Still return success even if push notification fails
//             res.status(200).json({
//                 status: 'Partial Success',
//                 message: 'Notification saved but push notification may have failed',
//                 data: { id: notificationId, userId, title, message },
//             });
//         }
//     });
// };



// export const updatePushToken = (req, res) => {
//   const { userId, expoPushToken } = req.body;

//   if (!expoPushToken) {
//       return res.status(400).json({
//           status: 'Failed',
//           message: 'Push token is required'
//       });
//   }

//   // const userId = req.user?.id;

//   if (!userId) {
//       return res.status(401).json({
//           status: 'Failed',
//           message: 'Unauthorized: User not found'
//       });
//   }

//   const updateQuery = `
//       UPDATE users 
//       SET expoPushToken = ? 
//       WHERE id = ?
//   `;

//   db.query(updateQuery, [expoPushToken, userId], (err, result) => {
//       if (err) {
//           return res.status(500).json({ 
//               status: 'Failed', 
//               message: 'Database error', 
//               error: err 
//           });
//       }

//       if (result.affectedRows === 0) {
//           return res.status(404).json({
//               status: 'Failed',
//               message: 'User not found or no update needed'
//           });
//       }

//       res.status(200).json({
//           status: 'Success',
//           message: 'Push token updated successfully'
//       });
//   });
// };

  


export const getUserNotifications = (req, res) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'Failed', errors: errors.array() });
    }

  const { userId } = req.params;

  // Check if the user exists
  const userCheckQuery = `SELECT id FROM users WHERE id = ?`;

  db.query(userCheckQuery, [userId], (err, userResult) => {
    if (err) {
      return res.status(500).json({ status: 'Failed', message: 'Database error', error: err });
    }

    if (userResult.length === 0) {
      return res.status(404).json({ status: 'Failed', message: 'User not found' });
    }

    // Fetch notifications if user exists
    const query = `
      SELECT 
        n.id AS notificationId, 
        n.title, 
        n.message, 
        n.createdAt, 
        COALESCE(un.isRead, false) AS isRead
      FROM notifications n
      LEFT JOIN user_notifications un ON n.id = un.notificationId AND un.userId = ?
      WHERE n.userId = 'All' OR n.userId = ?
      ORDER BY n.createdAt DESC
    `;

    db.query(query, [userId, userId], (err, results) => {
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

