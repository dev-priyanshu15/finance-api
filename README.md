# Finance API

A production-ready Financial Records Management REST API built with NestJS, PostgreSQL, Redis, Bull Queue, WebSockets, and JWT Authentication.

## Overview

This API enables users to manage personal financial records with role-based access control. It supports income/expense tracking, category-wise breakdowns, monthly trend analysis, and real-time notifications via WebSockets.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS (TypeScript) |
| Database | PostgreSQL |
| ORM | Prisma |
| Cache/Queue | Redis + Bull |
| Auth | JWT (Access + Refresh Tokens) |
| Real-time | WebSockets (Socket.io) |
| Email | Nodemailer + Gmail SMTP |
| Rate Limiting | @nestjs/throttler |

## Roles & Access Control

| Role | Permissions |
|------|------------|
| VIEWER | Read-only access to own records and dashboard |
| ANALYST | Create, read, update, delete own records |
| ADMIN | Full access — manage all users and records |

## Project Structure
src/
├── auth/           # JWT auth, login, signup, password reset
├── users/          # User profile management
├── records/        # Financial records CRUD
├── dashboard/      # Analytics and summary APIs
├── gateway/        # WebSocket gateway
├── queue/          # Bull queue producers and consumers
├── mail/           # Email service (Nodemailer)
├── common/
│   ├── guards/     # RolesGuard
│   ├── decorators/ # @Roles(), @GetUser()
│   └── filters/    # Global exception filter
└── prisma/         # Prisma service and schema

## Database Schema

### User
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | String | Unique |
| password | String | Bcrypt hashed |
| name | String? | Optional |
| role | Enum | VIEWER / ANALYST / ADMIN |
| isDeleted | Boolean | Soft delete |
| refreshToken | String? | Hashed refresh token |
| resetToken | String? | Password reset token |
| resetTokenExpiry | DateTime? | Token expiry |

### FinancialRecord
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| amount | Float | Transaction amount |
| type | String | "income" or "expense" |
| category | String | e.g. salary, food, rent |
| date | DateTime | Transaction date |
| notes | String? | Optional description |
| userId | String | Foreign key to User |
| isDeleted | Boolean | Soft delete |

## Setup Instructions

### Prerequisites
- Node.js v18+
- PostgreSQL
- Redis
- Docker (optional)

### 1. Clone the repository
```bash
git clone https://github.com/dev-priyanshu15/assignment1.git
cd assignment1
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/financedb"
JWT_SECRET="your_jwt_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
REDIS_HOST=localhost
REDIS_PORT=6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your@gmail.com
FRONTEND_URL=http://localhost:3001
RESET_TOKEN_EXPIRY_HOURS=1
```

### 4. Start PostgreSQL with Docker
```bash
docker run --name finance-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=financedb \
  -p 5433:5432 -d postgres:16-alpine
```

### 5. Start Redis with Docker
```bash
docker run --name redis-finance -p 6379:6379 -d redis:alpine
```

### 6. Run database migrations
```bash
npx prisma migrate dev
```

### 7. Start the server
```bash
npm run start:dev
```

Server runs at `http://localhost:3000`

## API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/signup | Register new user | No |
| POST | /auth/login | Login and get tokens | No |
| POST | /auth/logout | Logout (invalidate token) | Yes |
| POST | /auth/refresh | Get new access token | Refresh Token |
| POST | /auth/forgot-password | Send reset email | No |
| POST | /auth/reset-password | Reset password with token | No |

### Financial Records

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | /records | Create a record | ANALYST, ADMIN |
| GET | /records | Get all own records (paginated) | All |
| GET | /records/:id | Get single record | All |
| PATCH | /records/:id | Update a record | ANALYST, ADMIN |
| DELETE | /records/:id | Soft delete a record | ANALYST, ADMIN |

Query params for GET /records: `?page=1&limit=10&type=income&category=salary`

### Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /dashboard/summary | Total income, expenses, net balance | Yes |
| GET | /dashboard/category-breakdown | Per-category income/expense | Yes |
| GET | /dashboard/monthly-trends | Month-wise income/expense trends | Yes |
| GET | /dashboard/recent-activity | Last 10 transactions | Yes |

### Users

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | /users/me | Get own profile | All |
| PATCH | /users/me | Update own profile | All |
| DELETE | /users/me | Soft delete own account | All |
| GET | /users | Get all users (paginated) | ADMIN |
| PATCH | /users/:id | Update any user | ADMIN |
| DELETE | /users/:id | Soft delete any user | ADMIN |
| POST | /users/:id/restore | Restore deleted user | ADMIN |

## Key Features

### JWT Authentication
- Access token expires in 15 minutes
- Refresh token expires in 7 days
- Refresh tokens are hashed before storing in DB
- Logout invalidates refresh token across all devices

### Rate Limiting
- 10 requests/second (burst protection)
- 100 requests/minute (general protection)
- 1000 requests/hour (brute force protection)
- Login/Signup limited to 5 requests/minute

### Background Jobs (Bull Queue)
- Welcome email sent on signup via queue
- Password reset email sent via queue
- Automatic retry with exponential backoff (3 attempts)

### WebSockets
- Real-time notifications on record create/update/delete
- JWT-authenticated socket connections
- Room-based broadcasting per user

### Global Exception Filter
All errors return consistent format:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": null,
  "path": "/records",
  "timestamp": "2026-04-03T00:00:00.000Z"
}
```

## Sample Requests

### Signup
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Priyanshu","email":"test@gmail.com","password":"123456"}'
```

### Create Record
```bash
curl -X POST http://localhost:3000/records \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":5000,"type":"income","category":"salary","date":"2026-04-01"}'
```

### Get Dashboard Summary
```bash
curl http://localhost:3000/dashboard/summary \
  -H "Authorization: Bearer <token>"
```