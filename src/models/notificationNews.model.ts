import mongoose from 'mongoose';

const notificationNewsSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    news_id: { type: mongoose.Schema.Types.ObjectId, ref: 'News', required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const NotificationNews = mongoose.model('NotificationNews', notificationNewsSchema);
export default NotificationNews;
