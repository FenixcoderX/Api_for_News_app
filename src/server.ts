import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Create a new express server
const app: express.Application = express();
const address: string = '0.0.0.0:3001';

// Load the environment variables from the .env file into process.env
dotenv.config();

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

// Start the Express server
app.listen(3001, () => {
  console.log(`starting app on: ${address}`);
});

export default app;
