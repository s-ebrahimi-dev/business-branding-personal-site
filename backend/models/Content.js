
import mongoose from 'mongoose';

const translationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },

    summary: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    body: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const podcastSchema = new mongoose.Schema(
  {
    audioUrl: {
      type: String,
      trim: true,
      default: '',
    },

    durationSeconds: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const contentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['article', 'note', 'podcast'],
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      maxlength: 160,
    },

    content: {
      en: translationSchema,
      fa: translationSchema,
    },

    coverImage: {
      type: String,
      trim: true,
      default: '',
    },

    podcast: {
      type: podcastSchema,
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

contentSchema.index({
  type: 1,
  'content.en.status': 1,
  updatedAt: -1,
});

contentSchema.index({
  type: 1,
  'content.fa.status': 1,
  updatedAt: -1,
});

const Content = mongoose.model('Content', contentSchema);

export default Content;
