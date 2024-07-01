// Handlers for news routes

import express, { NextFunction, Request, Response } from 'express';
import News from '../models/news.model';
import { verifyAuthToken } from '../middleware/verification';
import { errorHandler } from '../middleware/error';
import { notificationNewsCreate } from '../services/notificationNewsCreate';

// Handler functions here

/**
 * Retrieves all news from the database and sends them as a response
 *
 * @param {Request}_req - The request object (unused)
 * @param {Response} res - The response object used to send all news
 * @param {NextFunction} next - The next function used to pass the error to the error handling middlewares
 *
 */
const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all news from the database
    const news = await News.find();

    // Send the news as a response
    res.status(200).json(news);
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves all published news from the database and sends them as a response
 *
 * @param {Request}_req - The request object (unused)
 * @param {Response} res - The response object used to send all published news
 * @param {NextFunction} next - The next function used to pass the error to the error handling middlewares
 *
 */
const getAllPublished = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const currentDate = new Date();

    // Get all published news from the database
    const publishedNews = await News.find({ status: 'published' });

    // Send the published news as a response
    res.status(200).json(publishedNews);
  } catch (err) {
    next(err);
  }
};

/**
 * Creates a new news
 *
 * @param {Request} req - The request object containing the news information to create
 * @param {Response} res - The response object with the saved news
 * @param {NextFunction} next - The next function used to pass the error to the error handling middlewares
 */
const create = async (req: Request, res: Response, next: NextFunction) => {
  const { title, images = [], content, files = [], author, publishDate, status } = req.body;

  if (!author || author !== req.body.decoded.id || author === '') {
    return next(errorHandler(401, 'Unauthorized'));
  }

  if (!title || !content || title === '' || content === '') {
    return next(errorHandler(400, 'Title and content fields are required'));
  }

  if (title.length > 100) {
    return next(errorHandler(400, 'Title should not exceed 100 characters'));
  }

  // Create a new News
  const newNews = new News({
    title,
    images,
    content,
    files,
    author,
    publishDate,
    status,
  });

  try {
    // Get saved news from the database
    const savedNews = await newNews.save();
    // Send the news as a response
    res.status(200).json(savedNews);
    // Create a notification for each user when a new news is created
    if (savedNews.status === 'published') {
      notificationNewsCreate(savedNews.author.toString(), 'create', savedNews._id.toString(), `"${savedNews.title}" news created`);
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Updates an existing news item
 *
 * @param {Request} req - The request object containing the news data to update
 * @param {Response} res - The response object used to send back the updated news
 * @param {NextFunction} next - The next function used to pass the error to the error handling middlewares
 */
const updateNews = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { title, images = [], content, files = [], publishDate, status } = req.body;
  const userId = req.body.decoded.id;

  // Find the news item to update
  const newsItem = await News.findById(id);

  if (!newsItem) {
    return next(errorHandler(404, 'News not found'));
  }

  // Check that the user is the author of the news
  if (newsItem.author.toString() !== userId) {
    return next(errorHandler(403, 'You are not allowed to update this news'));
  }

  try {
    const updatedNews = await News.findByIdAndUpdate(id, { title, images, content, files, publishDate, status }, { new: true, runValidators: true });

    if (!updatedNews) {
      return next(errorHandler(404, 'News not found'));
    }
    // Create a notification for each user when the news is updated
    if (updatedNews.status === 'published' && newsItem.status !== 'published') {
      notificationNewsCreate(updatedNews.author.toString(), 'update', updatedNews._id.toString(), `"${updatedNews.title}" news updated`);
    }
    if (updatedNews.status === 'published' && newsItem.status !== 'draft') {
      notificationNewsCreate(updatedNews.author.toString(), 'update', updatedNews._id.toString(), `"${updatedNews.title}" news created`);
    }
    res.json(updatedNews);
  } catch (err) {
    next(errorHandler(500, 'Error updating news'));
  }
};

/**
 * Deletes an existing news item
 *
 * @param {Request} req - The request object containing the ID of the news to delete
 * @param {Response} res - The response object used to send back the deletion confirmation
 * @param {NextFunction} next - The next function used to pass the error to the error handling middlewares
 */
const deleteNews = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.body.decoded.id;

  // Find the news item to delete
  const newsItem = await News.findById(id);

  if (!newsItem) {
    return next(errorHandler(404, 'News not found'));
  }

  // Check that the user is the author of the news
  if (newsItem.author.toString() !== userId) {
    return next(errorHandler(403, 'You are not allowed to delete this news'));
  }

  try {
    const deletedNews = await News.findOneAndDelete({ _id: id });

    if (!deletedNews) {
      return next(errorHandler(404, 'News not found'));
    }

    res.status(200).json('The news has been deleted');
    if (deletedNews.status === 'published') {
      notificationNewsCreate(deletedNews.author.toString(), 'delete', deletedNews._id.toString(), `"${deletedNews.title}" news deleted`);
    }
  } catch (err) {
    next(errorHandler(500, 'Error deleting news'));
  }
};

// Express routes here

/**
 * Routes for questions endpoints
 *
 * @param {express.Application} app - The express application object
 */
const questionRoutes = (app: express.Application) => {
  // Route to send all News
  app.get('/news/allnews', getAll);

  // Route to send all published News
  app.get('/news/allpublishednews', getAllPublished);

  // Route to create a new News item
  app.post('/news/create', verifyAuthToken, create);

  // Route to update an existing News item
  app.put('/news/update/:id', verifyAuthToken, updateNews);

  // Route to delete an existing News item
  app.delete('/news/delete/:id', verifyAuthToken, deleteNews);
};

export default questionRoutes;
