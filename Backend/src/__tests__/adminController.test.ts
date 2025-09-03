import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server';
import User from '../models/userModel';
import Job from '../models/jobModel';
import Application from '../models/applicationModel';
import { signToken } from '../utils/auth';

let mongoServer: MongoMemoryServer;
let adminToken: string;
let employerToken: string;
let userId: string;
let jobId: string;

// Test data
const adminData = {
  name: 'Test Admin',
  email: 'admin@test.com',
  password: 'test1234',
  passwordConfirm: 'test1234',
  role: 'admin'
};

const employerData = {
  name: 'Test Employer',
  email: 'employer@test.com',
  password: 'test1234',
  passwordConfirm: 'test1234',
  role: 'employer'
};

const userData = {
  name: 'Test User',
  email: 'user@test.com',
  password: 'test1234',
  passwordConfirm: 'test1234',
  role: 'user'
};

const jobData = {
  title: 'Admin Test Job',
  description: 'This is a test job for admin operations',
  location: 'Remote',
  type: 'full-time',
  category: 'Testing',
  requirements: ['Testing experience'],
  skills: ['Testing'],
  company: {
    name: 'Test Company',
    website: 'https://testcompany.com'
  },
  experienceLevel: 'mid',
  remote: true
};

beforeAll(async () => {
  // Create in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create test users and job
  const [admin, employer, user, job] = await Promise.all([
    User.create(adminData),
    User.create(employerData),
    User.create(userData),
    Job.create({
      ...jobData,
      createdBy: new mongoose.Types.ObjectId() // Random ID since we don't need a real user
    })
  ]);

  userId = user._id.toString();
  jobId = job._id.toString();

  // Generate tokens
  adminToken = signToken(admin._id);
  employerToken = signToken(employer._id);

  // Create some test applications
  await Application.create([
    {
      job: job._id,
      user: user._id,
      status: 'pending'
    },
    {
      job: job._id,
      user: employer._id,
      status: 'reviewing'
    }
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Admin Controller', () => {
  describe('User Management', () => {
    it('should get all users', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.users)).toBeTruthy();
      expect(res.body.results).toBe(3); // admin, employer, and user
    });

    it('should update user role', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${userId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'employer' })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.user.role).toBe('employer');
    });

    it('should delete a user', async () => {
      await request(app)
        .delete(`/api/v1/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Verify user is deleted
      const user = await User.findById(userId);
      expect(user).toBeNull();
    });
  });

  describe('Job Management', () => {
    it('should get all jobs', async () => {
      const res = await request(app)
        .get('/api/v1/admin/jobs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.jobs)).toBeTruthy();
      expect(res.body.results).toBe(1);
    });

    it('should delete any job', async () => {
      await request(app)
        .delete(`/api/v1/admin/jobs/${jobId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Verify job is deleted
      const job = await Job.findById(jobId);
      expect(job).toBeNull();
    });
  });

  describe('Dashboard', () => {
    it('should get dashboard statistics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.stats).toHaveProperty('totalUsers');
      expect(res.body.data.stats).toHaveProperty('totalJobs');
      expect(res.body.data.stats).toHaveProperty('totalApplications');
      expect(Array.isArray(res.body.data.recentApplications)).toBeTruthy();
    });
  });

  describe('Access Control', () => {
    it('should prevent non-admin from accessing admin routes', async () => {
      await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${employerToken}`)
        .expect(403);
    });
  });
});
