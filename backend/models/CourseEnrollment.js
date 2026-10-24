
import mongoose from 'mongoose';

const courseEnrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },

    accessType: {
      type: String,
      enum: ['manual', 'purchase'],
      required: true,
    },

    status: {
      type: String,
      enum: ['active', 'revoked', 'expired'],
      default: 'active',
      required: true,
    },

    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    grantedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    purchaseAmount: {
      type: Number,
      min: 0,
      default: null,
    },

    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'USD',
    },

    paymentReference: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// A user should have only one enrollment record per course.
courseEnrollmentSchema.index(
  {
    user: 1,
    course: 1,
  },
  {
    unique: true,
  }
);

// Retrieve active enrollments for a user.
courseEnrollmentSchema.index({
  user: 1,
  status: 1,
});

// Retrieve enrolled users for a course.
courseEnrollmentSchema.index({
  course: 1,
  status: 1,
});

const CourseEnrollment = mongoose.model(
  'CourseEnrollment',
  courseEnrollmentSchema
);

export default CourseEnrollment;
