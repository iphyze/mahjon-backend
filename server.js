import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.js'
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

// Initialize the app
const app = express();

app.use(cors());

// Middleware
app.use(bodyParser.json());

// Welcome route for base endpoint
app.get('/mahjon', (req, res) => {
  res.send('Welcome to Mahjon API 😊');
});

app.post('/mahjon', (req, res) => {
  res.send('Welcome to Mahjon API 😊');
});

// User routes
app.use('/mahjon', authRoutes);



// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
