import mongoose from 'mongoose';

const teamRequestSchema = new mongoose.Schema(
  {
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: [true, 'Associated Hackathon is required'],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author user is required'],
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'College reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    skillsNeeded: {
      type: [String],
      required: [true, 'At least one skill is required'],
      index: true,
    },
    teamSizeNeeded: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

teamRequestSchema.index({ collegeId: 1, status: 1 });
teamRequestSchema.index({ collegeId: 1, createdAt: -1 });
teamRequestSchema.index({ hackathon: 1, collegeId: 1 });

const TeamRequest = mongoose.models.TeamRequest || mongoose.model('TeamRequest', teamRequestSchema);
export default TeamRequest;
