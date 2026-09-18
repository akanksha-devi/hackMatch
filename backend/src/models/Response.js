import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema(
  {
    teamRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamRequest',
      required: [true, 'Associated Team Request is required'],
      index: true,
    },
    respondent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Respondent user is required'],
      index: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'College reference is required'],
      index: true,
    },
    message: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

responseSchema.index({ teamRequest: 1, respondent: 1 });
responseSchema.index({ collegeId: 1, status: 1 });
responseSchema.index({ respondent: 1, createdAt: -1 });

const Response = mongoose.models.Response || mongoose.model('Response', responseSchema);
export default Response;
