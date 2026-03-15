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

// Middleware
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:3000'
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth'
        }
    });
});

// Database connection and server start
const startServer = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✓ Database connection established successfully.');

        // Sync models (use { force: false } in production)
        await sequelize.sync({ alter: false });
        console.log('✓ Database models synchronized.');

        // Start server
        app.listen(PORT, () => {
            console.log(`✓ Server is running on port ${PORT}`);
            console.log(`✓ API available at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('✗ Unable to connect to the database:', error);
        process.exit(1);
    }
};

startServer();      
