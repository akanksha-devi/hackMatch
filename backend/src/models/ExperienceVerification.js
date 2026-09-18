import mongoose from 'mongoose';

const experienceVerificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'College institution reference is required'],
      index: true,
    },
    requestedLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: [true, 'Requested experience level is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    githubUrl: {
      type: String,
      default: '',
      trim: true,
    },
    portfolioUrl: {
      type: String,
      default: '',
      trim: true,
    },
    projectLinks: {
      type: [String],
      default: [],
    },
    certificationLinks: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: [true, 'Description/proof of experience is required'],
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewNote: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

experienceVerificationSchema.index({ collegeId: 1, status: 1 });
experienceVerificationSchema.index({ user: 1, createdAt: -1 });

const ExperienceVerification =
  mongoose.models.ExperienceVerification ||
  mongoose.model('ExperienceVerification', experienceVerificationSchema);

export default ExperienceVerification;
