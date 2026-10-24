
import mongoose from 'mongoose';

const workshopTranslationSchema = new mongoose.Schema(
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

const workshopSchema = new mongoose.Schema(
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

    content: {
      en: workshopTranslationSchema,
      fa: workshopTranslationSchema,
    },

    coverImage: {
      type: String,
      trim: true,
      default: '',
    },

    format: {
      type: String,
      enum: ['in-person', 'online'],
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

    capacity: {
      type: Number,
      min: 1,
      default: null,
      validate: {
        validator(value) {
          return value === null || Number.isInteger(value);
        },
        message: 'Capacity must be a positive integer or null.',
      },
    },

    status: {
      type: String,
      enum: ['draft', 'published', 'completed', 'cancelled'],
      default: 'draft',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

workshopSchema.index({
  status: 1,
  format: 1,
  updatedAt: -1,
});

const Workshop = mongoose.model('Workshop', workshopSchema);

export default Workshop;
