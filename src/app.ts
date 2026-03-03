import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { HttpError } from './errors/http-error';

// IMPORT API ROUTES
import authRoutes from './routes/auth.route';
import adminRoutes from './routes/admin.route';
import roomRoutes from './routes/add.room.route';
import roomTypeRoutes from './routes/room.type.route';
import { appointmentRouter } from './routes/appointment.route';

dotenv.config();

const app: Application = express();

let corsOptions = {
    origin: (origin: any, callback: any) => {
        // Allow all origins for development
        callback(null, true);
    },
    optionsSuccessStatus: 200,
    credentials: true,
};

// CORS middleware
app.use(cors(corsOptions));

// Static file serving
app.use('/public', express.static(path.join(__dirname, '../public')));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/add-room', roomRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/appointments', appointmentRouter);

// Welcome endpoint
app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({ success: true, message: "Welcome to the API" });
});

// Global error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

export default app;
