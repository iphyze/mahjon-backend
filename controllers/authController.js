import {loginUser} from '../services/users/loginService.js';
import {createUser} from '../services/users/createUserService.js';


export const loginHandler = loginUser;
export const registerUser = createUser;



// // Update user details
// export const updateUser = async (req, res) => {
//   const { fname, lname, email, password, confirmPassword, oldPassword, integrity, updated_by } = req.body; // Include oldPassword for password change
//   const userId = req.params.id; // Get the user ID from the request parameters

//   // Validate required fields
//   if (!fname || !lname || !email || !staff_type) {
//     return res.status(400).json({ message: 'First name, last name, email, and integrity are required.' });
//   }

//   // Check if the email format is valid
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email validation regex
//   if (!emailRegex.test(email)) {
//     return res.status(400).json({ message: 'Please provide a valid email address.' });
//   }

//   // Check if the user exists
//   const sqlCheckUser = 'SELECT * FROM admin_table WHERE id = ?';
  
//   db.query(sqlCheckUser, [userId], async (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: err });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ message: 'User not found.' });
//     }


//     // Get the current timestamp
//     const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

//     // Prepare data for updating
//     const updatedFields = { fname, lname, email, integrity, updated_by};

//     // Handle password update if provided
//     if (password) {
//       // Check if old password is provided
//       if (!oldPassword) {
//         return res.status(400).json({ message: 'Old password is required to change the password.' });
//       }

//       // Verify the old password
//       const user = results[0];
//       const isMatch = await bcrypt.compare(oldPassword, user.password);
//       if (!isMatch) {
//         return res.status(401).json({ message: 'Old password is incorrect.' });
//       }

//       // Ensure the new password and confirmation match
//       if (password !== confirmPassword) {
//         return res.status(400).json({ message: 'Password and confirm password do not match.' });
//       }

//       // Hash the new password
//       updatedFields.password = await bcrypt.hash(password, 10);
//     }


//     // Construct the SQL update query
//     const sqlUpdate = `UPDATE admin_table SET 
//       fname = ?, 
//       lname = ?, 
//       email = ?,
//       staff_type = ?,
//       updated_by = ?
//       ${password ? ', password = ?' : ''}
//       WHERE id = ?`;
    
//     // Prepare values array
//     const values = [...Object.values(updatedFields), userId];

//     // Execute the update query
//     db.query(sqlUpdate, values, (err, result) => {
//       if (err) {
//         return res.status(500).json({ error: err });
//       }


//       // Return updated user data
//       const updatedUser = {
//         id: userId,
//         fname,
//         lname,
//         email,
//         staff_type,
//         updated_by
//       };


//       res.status(200).json({ message: 'User details updated successfully.', data: updatedUser});
//     });
//   });
// };
