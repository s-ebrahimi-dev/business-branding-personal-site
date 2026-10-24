
import mongoose from 'mongoose';

const courseTranslationSchema = new mongoose.Schema(
  {

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

const courseSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      maxlength: 160,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },

    content: {
      en: courseTranslationSchema,
      fa: courseTranslationSchema,
    },

    coverImage: {
      type: String,
      trim: true,
      default: '',
    },

    accessType: {
      type: String,
      enum: ['public', 'restricted'],
      default: 'public',
      required: true,
    },

    price: {
      amount: {
        type: Number,
        min: 0,
        default: 0,
      },

      currency: {
        type: String,
        trim: true,
        uppercase: true,
        default: 'USD',
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

courseSchema.index({
  status: 1,
  accessType: 1,
  updatedAt: -1,
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
