import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { errorHandler } from './error';

interface DecodedData {
  id: string;
  iat: number;
}

/**
 * Middleware function to verify the validity of an authentication token
 *
 * @param {Request} req - The Express request object with the token in the cookie
 * @param {Response} _res - The Express response object (unused)
 * @param {NextFunction} next - The next middleware function
 */
export const verifyAuthToken = (req: Request, _res: Response, next: NextFunction) => {
  let token = req.cookies.access_token; // Save the token from the cookie
  
  if (!token) {
    console.log('no token');
    return next(errorHandler(401, 'Unauthorized'));
  }

  jwt.verify(token, process.env.TOKEN_SECRET as string, (err: any, decoded: any) => {
    if (err) {
      console.log('error', err);
      return next(errorHandler(401, 'Unauthorized'));
    }
    req.body.decoded = decoded;
    next();
  });
};
