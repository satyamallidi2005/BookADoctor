require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Initialize Express App
const app = express();

// Establish MongoDB Connection
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Serve uploads folder statically (prepares directories for file upload middleware later)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/doctorRoutes'));
app.use('/api', require('./routes/appointmentRoutes'));
app.use('/api', require('./routes/reportRoutes'));
app.use('/api', require('./routes/notificationRoutes'));

// Health Check / Root Test Route
app.get('/', (req, res) => {
  res.send('Book a Doctor Backend Running 🚀');
});

// Global Fallback Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    data: null,
  });
});

// Configure Starting Port
const PORT = process.env.PORT || 5000;

// Start Listener
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections safely
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
