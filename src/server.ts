
import express, { NextFunction, Request, Response } from 'express';

// Create a new express server
const app: express.Application = express();
const address: string = '0.0.0.0:3001';

// Define a route handler for the default home page
app.get('/', (req: Request, res: Response) => {
    res.send('This is API');
  });
  
// Start the Express server
app.listen(3001, () => {
    console.log(`starting app on: ${address}`);
  });

  export default app;