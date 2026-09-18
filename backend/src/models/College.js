import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'College name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'College code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    emailDomain: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const College = mongoose.models.College || mongoose.model('College', collegeSchema);
export default College;
