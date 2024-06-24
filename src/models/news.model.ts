import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    images: {
      type: [String],
    },
    content: { type: String, required: true },
    files: {
      type: [String],
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    publishDate: { type: Date },
    status: { type: String, default: 'draft' },
  },
  { timestamps: true }
);

const News = mongoose.model('News', newsSchema);

export default News;
