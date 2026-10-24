
import mongoose from 'mongoose';

const workshopRegistrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    workshop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workshop',
      required: true,
    },

    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkshopSession',
      required: true,
    },

    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'cancelled',
        'attended',
        'no-show',
      ],
      default: 'pending',
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: [
        'not-required',
        'pending',
        'paid',
        'failed',
        'refunded',
      ],
      default: 'pending',
      required: true,
    },

    amountPaid: {
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

    registeredAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// A user can have only one registration record per session.
workshopRegistrationSchema.index(
  {
    user: 1,
    session: 1,
  },
  {
    unique: true,
  }
);

// Useful for retrieving registrations for a particular session.
workshopRegistrationSchema.index({
  session: 1,
  status: 1,
});

// Useful for viewing a user's workshop history.
workshopRegistrationSchema.index({
  user: 1,
  registeredAt: -1,
});

const WorkshopRegistration = mongoose.model(
  'WorkshopRegistration',
  workshopRegistrationSchema
);

export default WorkshopRegistration;
