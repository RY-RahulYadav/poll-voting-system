# Real-Time Polling Application Backend

This is the backend service for a real-time polling application built with Node.js, Express, PostgreSQL, Prisma, and Socket.io.

## Features

- RESTful API endpoints for users, polls, and votes
- PostgreSQL database with Prisma ORM for data management
- Real-time updates through WebSockets using Socket.io
- JWT authentication for secure API access
- Proper handling of relationships between users, polls, and votes

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables by creating a `.env` file:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/polling_app?schema=public"
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user

### Polls
- `GET /api/polls` - Get all published polls
- `GET /api/polls/:id` - Get a specific poll by ID
- `POST /api/polls` - Create a new poll (authenticated)
- `PUT /api/polls/:id` - Update poll status (authenticated)
- `DELETE /api/polls/:id` - Delete a poll (authenticated)
- `GET /api/polls/user/my-polls` - Get polls created by the authenticated user

### Votes
- `POST /api/votes` - Cast a vote for a poll option (authenticated)
- `GET /api/votes/results/:pollId` - Get results for a specific poll
- `GET /api/votes/check/:pollId` - Check if the authenticated user has voted on a poll

## WebSocket Events

### Server to Client
- `poll-vote` - Emitted when a new vote is cast, includes updated poll results

### Client to Server
- `join-poll` - Join a specific poll room to receive updates
- `leave-poll` - Leave a poll room

## Database Schema

The application uses a PostgreSQL database with the following schema:

### User
- id (UUID)
- name (String)
- email (String, unique)
- passwordHash (String)
- createdAt (DateTime)
- updatedAt (DateTime)

### Poll
- id (UUID)
- question (String)
- isPublished (Boolean)
- creatorId (UUID, foreign key to User)
- createdAt (DateTime)
- updatedAt (DateTime)

### PollOption
- id (UUID)
- text (String)
- pollId (UUID, foreign key to Poll)
- createdAt (DateTime)
- updatedAt (DateTime)

### Vote
- id (UUID)
- userId (UUID, foreign key to User)
- pollOptionId (UUID, foreign key to PollOption)
- createdAt (DateTime)
- Unique constraint on [userId, pollOptionId]