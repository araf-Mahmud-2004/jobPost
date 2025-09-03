# Job Portal Backend

This is the backend for the Job Portal application, built with Node.js, Express, TypeScript, and MongoDB.

## Features

- User authentication and authorization
- Job posting and management
- Job application system
- Admin dashboard
- RESTful API

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd job-portal/Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your configuration.

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The server will start on `http://localhost:5000` by default.

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Forgot password
- `PATCH /api/auth/reset-password/:token` - Reset password
- `PATCH /api/auth/update-password` - Update password (requires authentication)

### Jobs

- `GET /api/jobs` - Get all jobs (with filtering, sorting, and pagination)
- `GET /api/jobs/:id` - Get a single job
- `POST /api/jobs` - Create a new job (requires authentication)
- `PATCH /api/jobs/:id` - Update a job (requires authentication, owner or admin)
- `DELETE /api/jobs/:id` - Delete a job (requires authentication, owner or admin)

### Applications

- `GET /api/applications/my-applications` - Get current user's applications (requires authentication)
- `GET /api/applications/job/:jobId` - Get applications for a job (requires authentication, job owner or admin)
- `POST /api/applications` - Apply for a job (requires authentication)
- `PATCH /api/applications/:id/status` - Update application status (requires authentication, job owner or admin)
- `DELETE /api/applications/:id` - Withdraw application (requires authentication, applicant only)

### Admin

- `GET /api/admin/users` - Get all users (admin only)
- `PATCH /api/admin/users/:id/role` - Update user role (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)
- `GET /api/admin/jobs` - Get all jobs (admin only)
- `DELETE /api/admin/jobs/:id` - Delete any job (admin only)
- `GET /api/admin/dashboard` - Get dashboard stats (admin only)

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token
- `JWT_EXPIRES_IN` - JWT expiration time (e.g., '90d')
- `SMTP_*` - Email configuration (for password reset, etc.)

## Testing

```bash
npm test
# or
yarn test
```

## Production

1. Build the project:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Start the production server:
   ```bash
   npm start
   # or
   yarn start
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
