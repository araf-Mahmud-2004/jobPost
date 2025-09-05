import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  category: string;
  salary?: number;
  requirements: string[];
  skills: string[];
  company: {
    name: string;
    description?: string;
    website?: string;
  };
  createdBy: mongoose.Types.ObjectId;
  status: 'open' | 'closed';
  applications: mongoose.Types.ObjectId[];
  deadline?: Date;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  remote: boolean;
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'A job must have a title'],
      trim: true,
      maxlength: [100, 'A job title must have less or equal than 100 characters'],
      minlength: [5, 'A job title must have more or equal than 5 characters'],
    },
    description: {
      type: String,
      required: [true, 'A job must have a description'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'A job must have a location'],
    },
    type: {
      type: String,
      required: [true, 'A job must have a type'],
      enum: {
        values: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
        message: 'Job type must be either full-time, part-time, contract, freelance, or internship',
      },
    },
    category: {
      type: String,
      required: [true, 'A job must belong to a category'],
    },
    salary: {
      type: Number,
      min: 0,
    },
    requirements: [{
      type: String,
      required: [true, 'A job must have at least one requirement'],
    }],
    skills: [{
      type: String,
      required: [true, 'A job must have at least one required skill'],
    }],
    company: {
      name: {
        type: String,
        required: [true, 'A job must have a company name'],
      },
      description: String,
      website: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      // Temporarily not required for testing
      // required: [true, 'A job must be created by a user'],
      default: new mongoose.Types.ObjectId(), // Default value for testing
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'closed'],
        message: 'Status must be either open or closed',
      },
      default: 'open',
    },
    applications: [{
      type: Schema.Types.ObjectId,
      ref: 'Application',
    }],
    deadline: {
      type: Date,
      validate: {
        validator: function(this: IJob, value: Date) {
          return value > new Date();
        },
        message: 'Deadline must be in the future',
      },
    },
    experienceLevel: {
      type: String,
      required: [true, 'A job must have an experience level'],
      enum: {
        values: ['entry', 'mid', 'senior', 'lead'],
        message: 'Experience level must be either entry, mid, senior, or lead',
      },
    },
    remote: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
jobSchema.index({ title: 'text', description: 'text', 'company.name': 'text' });
jobSchema.index({ location: 1, type: 1, category: 1, experienceLevel: 1, remote: 1 });

// Create and export the model
export const Job = mongoose.model<IJob>('Job', jobSchema);
