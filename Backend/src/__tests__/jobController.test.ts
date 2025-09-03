import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server';
import Job from '../models/jobModel';
import User from '../models/userModel';
import { signToken } from '../utils/auth';

let mongoServer: MongoMemoryServer;
let employerToken: string;
let adminToken: string;
let employerId: mongoose.Types.ObjectId;
let jobId: string;

// Test data
const employerData = {
  name: 'Test Employer',
  email: 'employer@test.com',
  password: 'test1234',
  passwordConfirm: 'test1234',
  role: 'employer'
};

const adminData = {
  name: 'Test Admin',
  email: 'admin@test.com',
  password: 'test1234',
  passwordConfirm: 'test1234',
  role: 'admin'
};

const jobData = {
  title: 'Senior Developer',
  description: 'We are looking for a senior developer',
  location: 'Remote',
  type: 'full-time',
  category: 'Development',
  salary: 100000,
  requirements: ['5+ years experience', 'Node.js', 'React'],
  skills: ['JavaScript', 'TypeScript', 'Node.js', 'React'],
  company: {
    name: 'Test Company',
    website: 'https://testcompany.com'
  },
  experienceLevel: 'senior',
  remote: true
};

beforeAll(async () => {
  // Create in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create test users
  const employer = await User.create(employerData);
  const admin = await User.create(adminData);
  employerId = employer._id;

  // Generate tokens
  employerToken = signToken(employer._id);
  adminToken = signToken(admin._id);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Job Controller', () => {
  describe('Create Job', () => {
    it('should create a new job', async () => {
      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', `Bearer ${employerToken}`)
        .send(jobData)
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data.job).toHaveProperty('_id');
      jobId = res.body.data.job._id;
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/v1/jobs')
        .send(jobData)
        .expect(401);
    });
  });

  describe('Get Jobs', () => {
    it('should get all jobs', async () => {
      const res = await request(app)
        .get('/api/v1/jobs')
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.jobs)).toBeTruthy();
      expect(res.body.results).toBeGreaterThan(0);
    });

    it('should get a single job by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/jobs/${jobId}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.job._id).toBe(jobId);
    });
  });

  describe('Update Job', () => {
    it('should update a job', async () => {
      const updateData = { title: 'Updated Job Title' };
      const res = await request(app)
        .patch(`/api/v1/jobs/${jobId}`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.job.title).toBe(updateData.title);
    });
  });

  describe('Delete Job', () => {
    it('should delete a job', async () => {
      await request(app)
        .delete(`/api/v1/jobs/${jobId}`)
        .set('Authorization', `Bearer ${employerToken}`)
        .expect(204);

      // Verify job is deleted
      const deletedJob = await Job.findById(jobId);
      expect(deletedJob).toBeNull();
    });
  });
});
