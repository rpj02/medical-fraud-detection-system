import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './config/database.js';
import apiRouter from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize Database
initDatabase();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static reports & uploads directories
app.use('/reports', express.static(path.join(__dirname, '../reports')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api', apiRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` MediFraud Guard Backend Running on http://localhost:${PORT}`);
  console.log(` Health Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
