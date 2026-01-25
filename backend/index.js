import express from 'express';
import connection from './config/databaseConection.js';        
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: './config/.env' });   
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());



connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }   
    console.log('Connected to the MySQL database.');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    }   );
});     