import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server';
import Job from '../models/jobModel';
import User from '../models/userModel';
import Application from '../models/applicationModel';
import { signToken } from '../utils/auth';

let mongoServer: MongoMemoryServer;
let employerToken: string;
let userToken: string;
let adminToken: string;
let jobId: string;
let applicationId: string;

// Test data
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

const adminData = {
  name: 'Test Admin',
  email: 'admin@test.com',
  password: 'test1234',
  passwordConfirm: 'test1234',
  role: 'admin'
};

const jobData = {
  title: 'Senior Developer',
  description: 'Looking for experienced developers',
  location: 'Remote',
  type: 'full-time',
  category: 'Development',
  requirements: ['5+ years experience'],
  skills: ['JavaScript', 'Node.js'],
  company: {
    name: 'Test Company',
    website: 'https://testcompany.com'
  },
  experienceLevel: 'senior',
  remote: true
};

const applicationData = {
  coverLetter: 'I am very interested in this position',
  resume: 'https://example.com/resume.pdf'
};

beforeAll(async () => {
  // Create in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create test users
  const [employer, user, admin] = await Promise.all([
    User.create(employerData),
    User.create(userData),
    User.create(adminData)
  ]);

  // Create a test job
  const job = await Job.create({
    ...jobData,
    createdBy: employer._id
  });
  jobId = job._id.toString();

  // Generate tokens
  employerToken = signToken(employer._id);
  userToken = signToken(user._id);
  adminToken = signToken(admin._id);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Application Controller', () => {
  describe('Apply for Job', () => {
    it('should allow a user to apply for a job', async () => {
      const res = await request(app)
        .post(`/api/v1/jobs/${jobId}/applications`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(applicationData)
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data.application).toHaveProperty('_id');
      applicationId = res.body.data.application._id;
    });

    it('should prevent duplicate applications', async () => {
      await request(app)
        .post(`/api/v1/jobs/${jobId}/applications`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(applicationData)
        .expect(400);
    });
  });

  describe('Get Applications', () => {
    it('should allow employer to view job applications', async () => {
      const res = await request(app)
        .get(`/api/v1/applications/job/${jobId}`)
        .set('Authorization', `Bearer ${employerToken}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.applications)).toBeTruthy();
      expect(res.body.results).toBeGreaterThan(0);
    });

    it('should allow users to view their own applications', async () => {
      const res = await request(app)
        .get('/api/v1/applications/my-applications')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.applications)).toBeTruthy();
    });
  });

  describe('Update Application Status', () => {
    it('should allow employer to update application status', async () => {
      const res = await request(app)
        .patch(`/api/v1/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: 'reviewing' })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.application.status).toBe('reviewing');
    });
  });

  describe('Withdraw Application', () => {
    it('should allow user to withdraw their application', async () => {
      await request(app)
        .delete(`/api/v1/applications/${applicationId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);

      // Verify application is marked as withdrawn
      const application = await Application.findById(applicationId);
      expect(application?.status).toBe('withdrawn');
    });
  });
});
