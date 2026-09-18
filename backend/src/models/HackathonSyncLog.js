import mongoose from 'mongoose';

const hackathonSyncLogSchema = new mongoose.Schema(
  {
    startedAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'PARTIAL', 'FAILED', 'RUNNING'],
      default: 'RUNNING',
      index: true,
    },
    source: {
      type: String,
      default: 'ALL',
      index: true,
    },
    fetchedCount: {
      type: Number,
      default: 0,
    },
    createdCount: {
      type: Number,
      default: 0,
    },
    updatedCount: {
      type: Number,
      default: 0,
    },
    expiredCount: {
      type: Number,
      default: 0,
    },
    skippedCount: {
      type: Number,
      default: 0,
    },
    errorCount: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

hackathonSyncLogSchema.index({ startedAt: -1 });

const HackathonSyncLog =
  mongoose.models.HackathonSyncLog ||
  mongoose.model('HackathonSyncLog', hackathonSyncLogSchema);

export default HackathonSyncLog;
