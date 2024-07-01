import express, { NextFunction, Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './handlers/authHandlers';
import newsRoutes from './handlers/newsHandlers';
import uploadFilesRoutes from './handlers/uploadFilesHandlers';
import { configureNotificationStream } from './services/notificationService';
import { initializeSocket } from './controllers/socketController';
import { startNewsPublishAndNotificationScheduler } from './services/schedulerNewsPublishAndNotification';


// Load the environment variables from the .env file into process.env
dotenv.config();

// Create a new express server
const app: express.Application = express();
const address: string = '0.0.0.0:3001';

// Create an HTTP server and pass it to socket.io with CORS configuration
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO as string)
  .then(() => {
    console.log('MongoDb is connected');
  })
  .catch((err) => {
    console.log(err);
  });

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  optionsSuccessStatus: 200,
  credentials: true,
};
// Use CORS middleware
app.use(cors(corsOptions));

// Use cookie parser middleware
app.use(cookieParser());

// Extracts the entire body portion of an incoming request stream and exposes it on req.body
app.use(express.json());

// Define a route handler for the default home page
app.get('/', (req: Request, res: Response) => {
  res.send('This is API');
});

// Start the news publish and notification creation sheduler
startNewsPublishAndNotificationScheduler();

// Start the Express server with Socket.IO
server.listen(3001, () => {
  console.log(`Server starting on: ${address}`);
});

// Socket.io setup
export const userSocketMap = new Map<string, string>();
initializeSocket(io);
configureNotificationStream();

// Define routes for the app
authRoutes(app);
newsRoutes(app);
uploadFilesRoutes(app);

export default app;

// Error handling middleware (should be the last app.use() call)
interface CustomError extends Error {
  statusCode: number;
}

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
