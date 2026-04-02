import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import receptionistRoutes from './routes/receptionistRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import clinicalRoutes from './routes/clinicalRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();
dotenv.config({ path: './config/.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Request Received`);
    
    // Add timeout to request
    res.setTimeout(15000, () => {
        console.error(`[${new Date().toISOString()}] ${req.method} ${req.url} - REQUEST TIMEOUT (15s)`);
        if (!res.headersSent) {
            res.status(504).json({ error: 'Request Timeout - Possible Backend Hang' });
        }
    });

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// JSON and URL encoding middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Middleware
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:5177',
        'http://localhost:3000'
    ],
    credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/receptionist', receptionistRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinical', clinicalRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/payments', paymentRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({
        message: 'Medical Center API',
        status: 'Online',
        timestamp: new Date().toISOString()
    });
});

// Final Error Handler
app.use((err, req, res, next) => {
    console.error('[Global Error Handler]', err);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Database connection and server start
const startServer = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('✓ Database connection established successfully.');

        // Sync models
        console.log('Synchronizing database models...');
        await sequelize.sync({ alter: false });
        console.log('✓ Database models synchronized.');

        // Start server
        const server = app.listen(PORT, () => {
            console.log(`✓ Server is running on port ${PORT}`);
            console.log(`✓ API available at http://localhost:${PORT}`);
        });

        server.on('error', (error) => {
            console.error('Server error:', error);
        });

    } catch (error) {
        console.error('✗ Unable to connect to the database:', error);
        // Don't exit immediately, log more info
        console.error('Check if MySQL is running on port 3307');
    }
};

startServer();
