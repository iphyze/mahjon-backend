import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

export default db;


// import mysql from 'mysql2/promise';
// import dotenv from 'dotenv';

// dotenv.config();

// const createPool = () => {
//   const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME,
//     port: process.env.DB_PORT || 3306,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
//     enableKeepAlive: true,
//     keepAliveInitialDelay: 0,
//     connectTimeout: 30000, // 30 seconds
//     acquireTimeout: 30000, // 30 seconds
//     timeout: 60000, // 60 seconds
//     // Handle disconnects
//     handleDisconnects: true,
//   });

//   // Test the connection
//   pool.getConnection()
//     .then(connection => {
//       console.log('Successfully connected to MySQL database');
//       connection.release();
//     })
//     .catch(err => {
//       console.error('Database connection failed:', err);
//       // Don't exit the process, let the application handle the error
//       throw err;
//     });

//   return pool;
// };

// // Create and export the pool
// const db = createPool();

// export default db;
