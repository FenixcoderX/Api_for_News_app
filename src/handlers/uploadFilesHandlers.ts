import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { verifyAuthToken } from '../middleware/verification';

const uploadedFilesDir = 'uploadedFiles';

// Check if the uploads directory exists, if not create it
if (!fs.existsSync(uploadedFilesDir)) {
  fs.mkdirSync(uploadedFilesDir, { recursive: true });
}

// Creare multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploadedFiles/'); // Path to save files
  },
  filename: (_req, file, cb) => {
    // Save the original file name without extension
    const originalFileName = path.basename(file.originalname, path.extname(file.originalname));
    // Create a new file name with the original name, a timestamp, and the original extension
    const extensionOfFile = path.extname(file.originalname);
    cb(null, `${originalFileName}-${Date.now()}${extensionOfFile}`);
  },
});

// Initialise multer with the storage configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // maximum 5 mb
  },
}).array('files', 5); //maximum 5 files

/**
 * Function for uploading files to the server
 *
 * @param {Request} req - The Express request object with the files to upload
 * @param {Response} res - The Express response object used to send the URLs of the uploaded files
 */
const uploadFiles = (req: Request, res: Response) => {
  upload(req, res, (err) => {
    // multer error handling
    if (err instanceof multer.MulterError) {
      return res.status(500).send(`Multer error: ${err.message}`);
      // unknown errors handling
    } else if (err) {
      return res.status(500).send(`Unknown error: ${err.message}`);
    }

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).send('At least one file must be uploaded');
    }

    // Create an array of URLs for the uploaded files
    const filesUrls = (req.files as Express.Multer.File[]).map((file) => {
      const encodedFilename = encodeURIComponent(file.filename);
      return `${process.env.SERVER_ADDRESS}/files/static/${encodedFilename}`;
    });

    res.json(filesUrls);
  });
};

/**
 * Routes for uploadFiles endpoints
 *
 * @param {express.Application} app - The express application object
 */
const uploadFilesRoutes = (app: express.Application) => {
  // Route to upload files to the server
  app.post('/files/upload',verifyAuthToken, uploadFiles);

  // Route to serve static files
  app.use('/files/static', express.static('uploadedFiles'));
};

export default uploadFilesRoutes;
