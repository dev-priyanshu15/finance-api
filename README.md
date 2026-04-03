# Finance API

A production-ready Financial Records Management REST API built with NestJS, PostgreSQL, Redis, Bull Queue, WebSockets, and JWT Authentication.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Setup Instructions](#setup-instructions)
- [API Reference](#api-reference)
- [Authentication & Security](#authentication--security)
- [Sample Requests](#sample-requests)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Project Status](#project-status)

## Overview

This API enables users to manage personal financial records with role-based access control (RBAC). It supports:

- Income and expense tracking with categorization
- Category-wise financial breakdowns and analysis
- Monthly trend analysis and historical data
- Real-time notifications via WebSockets
- Advanced authentication with JWT tokens
- Email notifications for password resets
- Background job processing with Bull Queue

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | NestJS | Latest |
| Language | TypeScript | 5.x |
| Database | PostgreSQL | 16 Alpine |
| ORM | Prisma | 5.22.0+ |
| Cache/Queue | Redis + Bull | Alpine |
| Authentication | JWT | HS256 |
| Real-time | Socket.io | WebSockets |
| Email | Nodemailer | Gmail SMTP |
| Rate Limiting | @nestjs/throttler | Built-in |
| API Documentation | Swagger/OpenAPI | 11.2.6 |

## Features

### Core Features

- User authentication with JWT and Refresh tokens
- Role-Based Access Control (VIEWER, ANALYST, ADMIN)
- Financial records CRUD operations
- Advanced filtering and pagination
- Real-time WebSocket notifications
- Dashboard analytics APIs
- Global exception handling
- Input validation using class-validator
- Rate limiting and throttling

### Advanced Features

- Email service integration (Gmail SMTP)
- Password reset via email with tokens
- Background job queue (Bull)
- Soft delete functionality
- Refresh token rotation
- Swagger API documentation
- Consistent error responses
- Automatic pagination metadata

## Roles & Access Control

| Role | Permissions | Actions |
|------|------------|---------|
| VIEWER | Read-only | View own records and dashboard analytics |
| ANALYST | Read-Write | Create, update, delete own financial records |
| ADMIN | Full Access | Manage all users and financial records |

## Project Structure

```
src/
├── auth/
│   ├── auth.service.ts          # Authentication logic
│   ├── auth.controller.ts       # Auth endpoints
│   ├── auth.module.ts
│   ├── dto/
│   │   ├── signup.dto.ts
│   │   ├── login.dto.ts
│   │   ├── forgot-password.dto.ts
│   │   └── reset-password.dto.ts
│   └── guards/
│       └── jwt-auth.guard.ts    # JWT validation guard
│
├── users/
│   ├── user.service.ts          # User management operations
│   ├── user.controller.ts       # User endpoints
│   ├── user.module.ts
│   └── dto/
│       └── update-user.dto.ts
│
├── records/
│   ├── records.service.ts       # Financial record operations
│   ├── records.controller.ts    # Record endpoints
│   ├── records.module.ts
│   └── dto/
│       ├── create-record.dto.ts
│       └── update-record.dto.ts
│
├── dashboard/
│   ├── dashboard.service.ts     # Analytics and aggregations
│   ├── dashboard.controller.ts  # Dashboard endpoints
│   └── dashboard.module.ts
│
├── gateway/
│   └── websocket.gateway.ts     # Real-time WebSocket connections
│
├── queue/
│   ├── queue.module.ts
│   ├── mail.producer.ts         # Email job producer
│   └── mail.consumer.ts         # Email job processor
│
├── mail/
│   └── mail.service.ts          # Nodemailer integration
│
├── common/
│   ├── guards/
│   │   └── roles.guard.ts       # Role-based access control
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   └── get-user.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   └── exceptions/
│       └── custom.exceptions.ts
│
├── prisma/
│   ├── prisma.service.ts
│   ├── prisma.module.ts
│   └── schema.prisma            # Database schema definition
│
├── app.module.ts                # Root application module
├── app.controller.ts
└── main.ts                      # Application entry point
```

## Database Schema

### User Table

```sql
CREATE TABLE "User" (
  id                UUID PRIMARY KEY DEFAULT uuid(),
  email             VARCHAR UNIQUE NOT NULL,
  password          VARCHAR NOT NULL,
  name              VARCHAR,
  role              ENUM('VIEWER', 'ANALYST', 'ADMIN') DEFAULT 'VIEWER',
  isDeleted         BOOLEAN DEFAULT false,
  refreshToken      VARCHAR,
  resetToken        VARCHAR,
  resetTokenExpiry  TIMESTAMP,
  createdAt         TIMESTAMP DEFAULT now(),
  updatedAt         TIMESTAMP
);
```

### FinancialRecord Table

```sql
CREATE TABLE "FinancialRecord" (
  id        UUID PRIMARY KEY DEFAULT uuid(),
  amount    FLOAT NOT NULL,
  type      VARCHAR NOT NULL,
  category  VARCHAR NOT NULL,
  date      TIMESTAMP NOT NULL,
  notes     VARCHAR,
  userId    UUID NOT NULL REFERENCES "User"(id),
  isDeleted BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP
);
```

## Setup Instructions

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- PostgreSQL 16 or higher
- Redis server
- Docker and Docker Compose (optional)

### 1. Clone Repository

```bash
git clone https://github.com/dev-priyanshu15/finance-api.git
cd finance-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/financedb"

# JWT Secrets
JWT_SECRET="your_jwt_secret_key_minimum_32_characters"
JWT_REFRESH_SECRET="your_refresh_secret_key_minimum_32_characters"

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Email Service (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@finance-api.com

# Application Configuration
FRONTEND_URL=http://localhost:3001
RESET_TOKEN_EXPIRY_HOURS=1
```

### 4. Database Setup

**Option A: Using Docker (Recommended)**

```bash
# Start PostgreSQL container
docker run --name finance-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=financedb \
  -p 5433:5432 -d postgres:16-alpine

# Start Redis container
docker run --name redis-finance \
  -p 6379:6379 -d redis:alpine
```

**Option B: Local Installation**

- Install PostgreSQL and create database named `financedb`
- Install Redis and ensure it runs on port 6379

### 5. Database Migration

```bash
# Run Prisma migrations
npx prisma migrate dev --name init

# View database in Prisma Studio
npx prisma studio
```

### 6. Start Development Server

```bash
# Start with hot-reload
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Debug mode
npm run start:debug
```

The server will be available at `http://localhost:3000`

## API Reference

### API Documentation

Complete API documentation is available via Swagger/OpenAPI at:

```
http://localhost:3000/api/docs
```

### Authentication Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|-----------------|
| POST | `/auth/signup` | Register new user account | None |
| POST | `/auth/login` | User login | None |
| POST | `/auth/logout` | Logout user | Bearer Token |
| POST | `/auth/refresh` | Get new access token | Refresh Token |
| POST | `/auth/forgot-password` | Send password reset email | None |
| POST | `/auth/reset-password` | Reset password with token | None |

**Request/Response Example:**

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### User Management Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/users/me` | Get current user profile | All |
| PATCH | `/users/me` | Update own profile | All |
| DELETE | `/users/me` | Delete own account | All |
| GET | `/users` | List all users (paginated) | ADMIN |
| PATCH | `/users/:id` | Update any user | ADMIN |
| DELETE | `/users/:id` | Delete any user | ADMIN |
| POST | `/users/:id/restore` | Restore deleted user | ADMIN |

**Query Parameters for GET /users:**
```
page=1&limit=10
```

### Financial Records Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/records` | Create new record | ANALYST, ADMIN |
| GET | `/records` | List records (paginated) | All |
| GET | `/records/:id` | Get single record | All |
| PATCH | `/records/:id` | Update record | ANALYST, ADMIN |
| DELETE | `/records/:id` | Soft delete record | ANALYST, ADMIN |

**Query Parameters for GET /records:**
```
page=1&limit=10&type=income&category=salary&sortBy=date&order=desc
```

**Request Body (POST/PATCH):**

```json
{
  "amount": 50000,
  "type": "income",
  "category": "salary",
  "date": "2026-04-01",
  "notes": "Monthly salary payment"
}
```

### Dashboard Analytics Endpoints

| Method | Endpoint | Description | Returns |
|--------|----------|-------------|---------|
| GET | `/dashboard/summary` | Income and expense summary | Total income, expenses, net balance |
| GET | `/dashboard/category-breakdown` | Per-category breakdown | Category-wise totals |
| GET | `/dashboard/monthly-trends` | Monthly trends | Month-wise income/expense |
| GET | `/dashboard/recent-activity` | Recent transactions | Last 10 records |

**Response Example (Summary):**

```json
{
  "totalIncome": 150000,
  "totalExpenses": 45000,
  "netBalance": 105000,
  "totalRecords": 15
}
```

## Authentication & Security

### JWT Token Management

- Access Token: Expires in 15 minutes
- Refresh Token: Expires in 7 days
- Algorithm: HS256 (HMAC SHA-256)

### Password Security

- Passwords hashed with bcrypt (10 salt rounds)
- Password reset tokens valid for 1 hour
- All tokens stored as hashed values

### Rate Limiting

```
Burst Protection:        10 requests/second
General Protection:      100 requests/minute
Brute Force Protection:  1000 requests/hour
Authentication Routes:   5 requests/minute (stricter)
```

### Role-Based Access Control (RBAC)

- RolesGuard validates user permissions
- Routes decorated with @Roles() specify required roles
- Unauthorized access returns 403 Forbidden

## Sample Requests

### User Registration

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

### User Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

### Create Financial Record

```bash
curl -X POST http://localhost:3000/records \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "type": "income",
    "category": "salary",
    "date": "2026-04-01",
    "notes": "Monthly salary"
  }'
```

### Retrieve Dashboard Summary

```bash
curl http://localhost:3000/dashboard/summary \
  -H "Authorization: Bearer <accessToken>"
```

### List Financial Records with Filtering

```bash
curl "http://localhost:3000/records?page=1&limit=10&type=expense&category=food" \
  -H "Authorization: Bearer <accessToken>"
```

## Testing

### Recommended Testing Tools

- Postman: API collection and testing
- Insomnia: REST client for API requests
- cURL: Command-line HTTP client
- Swagger UI: Interactive testing at `/api/docs`

### Manual Test Scenarios

**Scenario 1: Complete Authentication Flow**
1. Register new user via `/auth/signup`
2. Login via `/auth/login` and obtain tokens
3. Use access token for authenticated requests
4. Use refresh token to obtain new access token
5. Logout via `/auth/logout`

**Scenario 2: Role-Based Access Control**
1. Create user with VIEWER role
2. Attempt to create record as VIEWER (should fail with 403)
3. Update user role to ANALYST
4. Create record as ANALYST (should succeed)
5. Verify ADMIN can manage all records

**Scenario 3: Record Management**
1. Create multiple records of different types
2. Test pagination with various page/limit values
3. Filter records by type and category
4. Update record details
5. Delete record (verify soft delete)

**Scenario 4: Dashboard Analytics**
1. Create records with different categories
2. Verify summary calculations
3. Check category breakdown totals
4. Validate monthly trends
5. Confirm recent activity shows latest records

## Error Handling

All API responses follow a consistent error format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Descriptive error message",
  "errors": null,
  "path": "/records",
  "timestamp": "2026-04-03T10:30:00.000Z"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful request |
| 201 | Created | Resource successfully created |
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 500 | Server Error | Internal server error |

## Deployment

### Production Checklist

- [ ] Use strong, randomly generated JWT secrets
- [ ] Configure PostgreSQL with automated backups
- [ ] Set up Redis with persistence
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/TLS encryption
- [ ] Configure CORS for frontend domain
- [ ] Set up monitoring and logging
- [ ] Use production database credentials
- [ ] Implement database connection pooling
- [ ] Set up automated deployments

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### Environment Variables for Production

```env
DATABASE_URL="postgresql://user:secure_password@prod-db:5432/financedb"
JWT_SECRET="secure_random_string_32_chars_minimum"
JWT_REFRESH_SECRET="another_secure_random_string_32_chars"
REDIS_HOST="redis.production.com"
REDIS_PORT=6379
NODE_ENV="production"
```

## Troubleshooting

### Database Connection Error

**Error:** "Environment variable not found: DATABASE_URL"

**Solution:**
- Verify `.env` file exists in project root
- Check DATABASE_URL format is correct
- Test PostgreSQL connection manually
- Verify PostgreSQL server is running

### JWT Authentication Failed

**Error:** "Invalid token" or "401 Unauthorized"

**Solution:**
- Ensure Authorization header format: `Bearer <token>`
- Verify token hasn't expired (15 minutes for access token)
- Use refresh endpoint to obtain new access token
- Check JWT secrets match between token generation and validation

### Redis Connection Refused

**Error:** "ECONNREFUSED: Connection refused"

**Solution:**
- Verify Redis server is running: `redis-cli ping`
- Check REDIS_HOST and REDIS_PORT in `.env`
- Restart Redis container if using Docker
- Ensure port 6379 is not blocked by firewall

### Port Already in Use

**Error:** "EADDRINUSE: address already in use :::3000"

**Solution:**
- Identify process using port 3000
- Terminate the process gracefully
- Or configure different port in application
- Check for hung Node processes

### Email Not Sending

**Error:** "SMTP authentication failed"

**Solution:**
- Verify Gmail SMTP credentials in `.env`
- Enable "Less secure app access" in Gmail settings
- Use Gmail App Password instead of account password
- Check SMTP_HOST and SMTP_PORT values

## Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Implement changes with clear commits
3. Ensure code follows project conventions
4. Commit changes: `git commit -m "feat: description"`
5. Push to repository: `git push origin feature/feature-name`
6. Create Pull Request with detailed description

## License

This project is licensed under the MIT License.

## Contact & Support

- GitHub Repository: https://github.com/dev-priyanshu15/finance-api
- Issue Tracking: Report bugs via GitHub Issues
- Email: s.priyanshu.coder@gmail.com

## Project Status

### Current Version: 1.0.0

### Build Status

| Component | Status |
|-----------|--------|
| Core API | Production Ready |
| Authentication | Implemented and Tested |
| RBAC System | Implemented and Tested |
| Records Management | Implemented and Tested |
| Dashboard Analytics | Implemented and Tested |
| Email Service | Implemented and Tested |
| WebSocket Support | Implemented and Tested |
| API Documentation | Complete |

### Implementation Summary

| Requirement | Status | Details |
|-------------|--------|---------|
| User & Role Management | Complete | VIEWER, ANALYST, ADMIN roles with RBAC guards |
| Financial Records CRUD | Complete | Full CRUD operations with soft delete |
| Record Filtering | Complete | Filter by type, category, date with pagination |
| Dashboard APIs | Complete | 4 analytics endpoints (summary, breakdown, trends, activity) |
| Access Control | Complete | Role-based guards and decorator implementation |
| Input Validation | Complete | class-validator for all DTOs |
| Error Handling | Complete | Global exception filter with consistent responses |
| Data Persistence | Complete | PostgreSQL with Prisma ORM |
| JWT Authentication | Complete | Access and refresh token implementation |
| Password Reset | Complete | Email-based password reset with tokens |
| Rate Limiting | Complete | Throttling module with multiple limits |
| API Documentation | Complete | Swagger/OpenAPI documentation |

### Testing Results

All 22 API endpoints have been tested and verified:

- Authentication: 6/6 endpoints tested
- User Management: 7/7 endpoints tested
- Records: 5/5 endpoints tested
- Dashboard: 4/4 endpoints tested

### Known Limitations

- File upload and avatar storage not implemented
- No data export functionality (CSV, PDF export)
- Email service requires Gmail App Password configuration

### Last Updated

Date: April 3, 2026
Version: 1.0.0
Status: Complete and Tested

---

**Note:** This README provides comprehensive documentation for the Finance API. For the most current information, please refer to the Swagger documentation at http://localhost:3000/api/docs
