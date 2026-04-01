# TODO App Project

## Overview
This TODO app project is designed to help users manage their daily tasks efficiently. Users can create, update, and delete tasks while tracking their progress through an intuitive interface.

## Features
- User authentication: Sign up and log in to manage personal tasks securely.
- CRUD operations: Create, read, update, and delete tasks.
- Task prioritization: Prioritize tasks to focus on what's important.
- Deadline tracking: Set deadlines for tasks and receive reminders.
- Responsive design: Accessible on both desktop and mobile devices.

## Technology Stack
- **Frontend:** React.js
- **Backend:** Node.js with Express
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT)

## Architecture
The application follows a client-server architecture:
- **Client-side:** Built with React.js, responsible for rendering the UI and handling user interactions.
- **Server-side:** Built with Node.js, handles API requests, and interacts with the MongoDB database.

## Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone https://github.com/dev-priyanshu15/assignment1.git
   cd assignment1
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   - Create a `.env` file in the root directory and add the necessary variables (e.g., database connection string).
4. **Run the application:**
   ```bash
   npm start
   ```
5. **Access the app:** Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints
- `POST /api/tasks`: Create a new task.
- `GET /api/tasks`: Retrieve all tasks.
- `PUT /api/tasks/:id`: Update a task by ID.
- `DELETE /api/tasks/:id`: Delete a task by ID.

## Database Schema
The MongoDB schema for the tasks:
```json
{
  "title": "String",
  "description": "String",
  "completed": "Boolean",
  "deadline": "Date",
  "user": "ObjectId"
}
```

## Conclusion
This TODO app serves as a practical project for learning and demonstrating skills in full-stack development with a focus on task management. Feel free to contribute to its development!