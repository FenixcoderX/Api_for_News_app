import { ChangeStream } from 'mongodb';
import NotificationNews from '../models/notificationNews.model';
import { io } from '../server';
import { userSocketMap } from '../server';

let notificationStreamInstance: ChangeStream<any, any> | null = null;


/**
 * Initializes the notification stream and listens for changes
 * @returns The initialized notification stream
 */
export const initializeNotificationStream = () => {
  const notificationStream = NotificationNews.watch();

  notificationStream.on('change', (change) => {
    try {
      if (change.operationType === 'insert') {
        const notification = change.fullDocument;
        const userId = notification.user_id.toString();
        const socketId = userSocketMap.get(userId);
        if (socketId) {
          io.to(socketId).emit('notification', notification);
        }
      }
    } catch (error) {
      console.error('Error processing notification stream change:', error);
    }
  });

  notificationStream.on('error', (error) => {
    console.error('Error in notification stream:', error);
  });

  return notificationStream;
};


/**
 * Retrieves the instance of the notification stream
 * If the instance does not exist, it initializes a new one
 * @returns notification stream instance
 */
export const getNotificationStreamInstance = () => {
  if (!notificationStreamInstance) {
    notificationStreamInstance = initializeNotificationStream();
  }
  return notificationStreamInstance;
};


/**
 * Configures the notification stream
 */
export const configureNotificationStream = () => {
  getNotificationStreamInstance();
};
