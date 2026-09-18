import mongoose from 'mongoose';

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Hackathon title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    organizer: {
      type: String,
      default: '',
      trim: true,
    },
    mode: {
      type: String,
      enum: ['Online', 'Offline', 'Hybrid'],
      default: 'Online',
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    registrationDeadline: {
      type: Date,
    },
    registrationLink: {
      type: String,
      default: '',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    visibility: {
      type: String,
      enum: ['Global', 'College'],
      default: 'Global',
      index: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      index: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
      index: true,
    },
    // External Data Sync metadata
    source: {
      type: String,
      default: 'manual',
      trim: true,
      index: true,
    },
    externalId: {
      type: String,
      default: '',
      trim: true,
    },
    externalUrl: {
      type: String,
      default: '',
      trim: true,
    },
    sourceUpdatedAt: {
      type: Date,
      default: null,
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    firstSeenAt: {
      type: Date,
      default: Date.now,
    },
    contentHash: {
      type: String,
      default: '',
    },
    isExternal: {
      type: Boolean,
      default: false,
      index: true,
    },
    syncStatus: {
      type: String,
      enum: ['active', 'expired', 'archived'],
      default: 'active',
      index: true,
    },
    manuallyOverridden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

hackathonSchema.index({ source: 1, externalId: 1 });
hackathonSchema.index({ isExternal: 1, syncStatus: 1 });
hackathonSchema.index({ visibility: 1, status: 1 });
hackathonSchema.index({ collegeId: 1, status: 1 });
hackathonSchema.index({ registrationDeadline: 1 });

const Hackathon = mongoose.models.Hackathon || mongoose.model('Hackathon', hackathonSchema);
export default Hackathon;
