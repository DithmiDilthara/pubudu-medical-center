import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();
dotenv.config({ path: './config/.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

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