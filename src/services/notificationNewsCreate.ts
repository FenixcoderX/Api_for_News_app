import NotificationNews from '../models/notificationNews.model';
import User from '../models/user.model';

/**
 * Creates a notification for each user when a new news is created, updated, or deleted
 * @param {string} author - The user ID of author of the news
 * @param {string} type - The type of the news
 * @param {string} news_id - The ID of the news
 * @param {string} message - The message for the notification
 */
export const notificationNewsCreate = async (author: string, type: string, news_id: string, message: string) => {
  try {
    const users = await User.find({});

    // Check if the type is valid
    if (type !== 'create' && type !== 'update' && type !== 'delete') {
      console.error('Invalid notification type:', type);
      return;
    }

    // Create a new notification for each user
    const notifications = users.map((user) => ({
      user_id: user._id,
      author,
      type,
      news_id,
      message,
    }));

    // Save new notifications to the database
    await NotificationNews.insertMany(notifications);
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};
