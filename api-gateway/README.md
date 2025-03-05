# API Gateway Microservice

This is an API Gateway microservice built with Node.js and TypeScript. It serves as a central entry point for the LMS system microservices architecture.

## Features

- Route proxying to different microservices
- JWT-based authentication
- Role-based access control (RBAC)
- Public and protected routes handling
- Error handling and service unavailability management
- CORS support
- Security headers with Helmet
- Environment configuration
- TypeScript support
- Health check endpoint

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the api-gateway directory
3. Install dependencies:
```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
AUTH_SERVICE_URL=http://localhost:3001
COURSES_SERVICE_URL=http://localhost:3002
NODE_ENV=development
JWT_SECRET=your-super-secret-key-change-in-production
```

## Available Scripts

- `npm run dev`: Starts the development server with hot-reload
- `npm run build`: Builds the TypeScript code
- `npm start`: Starts the production server

## API Routes and Role Access

The API Gateway proxies requests to the following services with role-based access control:

### Authentication Service (`/api/auth/*`)

Public Routes (no authentication required):
- `POST /api/auth/login`: User login
- `POST /api/auth/register`: User registration
- `POST /api/auth/forgot-password`: Password recovery request
- `POST /api/auth/reset-password`: Reset password

Protected Routes:
- `GET /api/auth/profile`: Get user profile (all authenticated users)
- `PUT /api/auth/change-password`: Change password (all authenticated users)
- `POST /api/auth/logout`: User logout (all authenticated users)
- `GET /api/auth/users`: List users (admin only)

### Courses Service (`/api/courses/*`)

Public Routes (no authentication required):
- `GET /api/courses/list`: List available courses
- `GET /api/courses/search`: Search courses
- `GET /api/courses/categories`: Get course categories

Protected Routes:
Student Access:
- `POST /api/courses/enroll`: Enroll in a course
- `GET /api/courses/progress`: Get course progress

Instructor Access:
- `POST /api/courses/create`: Create a new course
- `PUT /api/courses/edit`: Edit course details
- `GET /api/courses/analytics`: View course analytics

Admin Access:
- `DELETE /api/courses/delete`: Delete a course
- `POST /api/courses/approve`: Approve course content
- `GET /api/courses/analytics`: View course analytics

Shared Access:
- `GET /api/courses/my-courses`: Get user's courses (students and instructors)

### Health Check

- `GET /health`: Returns the current status of the API Gateway and user information if authenticated

## Authentication and Authorization

The API Gateway uses JWT (JSON Web Token) for authentication and role-based access control:

1. Obtain a JWT token by logging in through `/api/auth/login`
2. Include the token in the Authorization header of subsequent requests:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

### User Roles

The system supports three roles with different access levels:

1. **Student**
   - Can enroll in courses
   - View course progress
   - Access personal profile

2. **Instructor**
   - Create and edit courses
   - View course analytics
   - Access personal profile

3. **Admin**
   - Full system access
   - User management
   - Course approval and deletion
   - System analytics

## Error Handling

The API Gateway includes comprehensive error handling:

- 401 Unauthorized: Authentication required
- 403 Forbidden: Insufficient role permissions
- 404 Not Found: Route not found
- 500 Internal Server Error: Service unavailable or general errors

## Development

To start development:

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. The server will be available at `http://localhost:3000`

## Security Notes

1. Always change the `JWT_SECRET` in production
2. Use HTTPS in production
3. Consider implementing rate limiting for production use
4. Review and update CORS settings based on your requirements
5. Regularly audit role permissions
6. Monitor and log access attempts 