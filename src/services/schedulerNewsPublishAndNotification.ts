import cron from 'node-cron';
import News from '../models/news.model';
import { notificationNewsCreate } from './notificationNewsCreate';

/**
 * Starts the news publish and notification scheduler
 * This scheduler runs every minute to check for news that need to be published and creates notifications for them
 */
export async function startNewsPublishAndNotificationScheduler() {
  // Schedule the task to run every minute
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    try {
      //Find all news to update
      const newsToUpdate = await News.find({ status: 'draft', publishDate: { $lte: now } });

      // Update the status of the news to 'publish'
      if (newsToUpdate.length > 0) {
        const newsIDs = newsToUpdate.map((news) => news._id);
        await News.updateMany({ _id: { $in: newsIDs } }, { status: 'publish' });

        // Create notifications for every news that was updated
        newsToUpdate.forEach(async (news) => {
          await notificationNewsCreate(news.author.toString(), 'create', news._id.toString(), `"${news.title}" news created`);
        });
      }
    } catch (err) {
      console.error('Error updating news status/notification creation:', err);
    }
  });
}
