
import mongoose from 'mongoose';

const episodeTranslationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },

    description: {
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

const courseEpisodeSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },

    episodeNumber: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Episode number must be an integer.',
      },
    },

    content: {
      en: episodeTranslationSchema,
      fa: episodeTranslationSchema,
    },

    durationSeconds: {
      type: Number,
      min: 0,
      default: null,
    },

    isPreview: {
      type: Boolean,
      default: false,
    },

    media: {
      provider: {
        type: String,
        enum: ['unknown', 'youtube', 'vimeo', 'bunny', 'custom'],
        default: 'unknown',
      },

      videoId: {
        type: String,
        trim: true,
        default: '',
      },

      playbackUrl: {
        type: String,
        trim: true,
        default: '',
      },
    },

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Prevent duplicate episode numbers within the same course.
courseEpisodeSchema.index(
  {
    course: 1,
    episodeNumber: 1,
  },
  {
    unique: true,
  }
);

// Help retrieve published episodes for a course in episode order.
courseEpisodeSchema.index({
  course: 1,
  status: 1,
  episodeNumber: 1,
});

const CourseEpisode = mongoose.model(
  'CourseEpisode',
  courseEpisodeSchema
);

export default CourseEpisode;
