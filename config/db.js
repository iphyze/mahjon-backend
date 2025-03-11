// import mysql from 'mysql2';
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
  connectionLimit: 10,  // Allow up to 10 connections
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  queueLimit: 0
});

// Keep connections alive to prevent timeouts
setInterval(() => {
  db.query('SELECT 1', (err) => {
    if (err) console.error('Database keep-alive query failed:', err);
  });
}, 60000); // Runs every 60 seconds

// Test the connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database');
  connection.release(); // Release the connection back to the pool
});

export default db;
