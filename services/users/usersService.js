import db from '../../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

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