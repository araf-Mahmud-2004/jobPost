import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'interview' | 'accepted' | 'rejected';
  coverLetter?: string;
  resume: string;
  appliedAt: Date;
  updatedAt: Date;
  notes?: string;
  interviewDate?: Date;
  feedback?: string;
}

const applicationSchema = new Schema<IApplication>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Application must belong to a job'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application must belong to a user']
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected'],
      default: 'pending',
    },
    coverLetter: {
      type: String,
      trim: true,
    },
    resume: {
      type: String,
      required: [true, 'Please upload your resume'],
    },
    notes: {
      type: String,
      trim: true,
    },
    interviewDate: Date,
    feedback: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, user: 1 }, { unique: true });

// Populate job and user data when querying
applicationSchema.pre(/^find/, function (this: any, next) {
  this.populate({
    path: 'job',
    select: 'title company.name location',
  }).populate({
    path: 'user',
    select: 'name email photo',
  });
  next();
});

// Create and export the model
export const Application = mongoose.model<IApplication>('Application', applicationSchema);

export interface IApplicationDocument extends IApplication, mongoose.Document {}
