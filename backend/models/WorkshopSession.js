
import mongoose from 'mongoose';

const workshopSessionSchema = new mongoose.Schema(
  {
    workshop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workshop',
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          if (!this.startDate || !value) return true;
          return value > this.startDate;
        },
        message: 'Session end date must be after its start date.',
      },
    },

    timezone: {
      type: String,
      trim: true,
      default: 'Asia/Tehran',
      required: true,
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

    location: {
      name: {
        type: String,
        trim: true,
        default: '',
      },

      address: {
        type: String,
        trim: true,
        default: '',
      },
    },

    onlineMeeting: {
      provider: {
        type: String,
        enum: ['unknown', 'zoom', 'google-meet', 'teams', 'custom'],
        default: 'unknown',
      },

      meetingUrl: {
        type: String,
        trim: true,
        default: '',
      },
    },

    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

workshopSessionSchema.index({
  workshop: 1,
  startDate: 1,
});

workshopSessionSchema.index({
  status: 1,
  startDate: 1,
});

const WorkshopSession = mongoose.model(
  'WorkshopSession',
  workshopSessionSchema
);

export default WorkshopSession;
