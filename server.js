import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.js'
import usersRoutes from './routes/usersRoutes.js'
import paymentsRoutes from './routes/paymentsRoutes.js'
import gamesRoutes from './routes/gamesRoutes.js'
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

dotenv.config();

// Initialize the app
const app = express();

app.use(cors());

// Middleware
app.use(bodyParser.json());



// ✅ Serve static files for images
app.use('/imageUploads', express.static(path.join(process.cwd(), 'imageUploads')))


// Welcome route for base endpoint
app.get('/', (req, res) => {
  res.send('Welcome to Mahjon API 😊');
});

app.post('/', (req, res) => {
  res.send('Welcome to Mahjon API 😊');
});

// Welcome route for base endpoint
app.get('/api', (req, res) => {
  res.send('Welcome to Mahjon API 😊');
});

app.post('/api', (req, res) => {
  res.send('Welcome to Mahjon API 😊');
});





// Auth routes
app.use('/api/auth', authRoutes);

// Users routes
app.use('/api/users', usersRoutes);

app.use('/api/payment', paymentsRoutes);

app.use('/api/games', gamesRoutes);


// Server
const PORT = process.env.DB_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
