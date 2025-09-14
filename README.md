# Real-Time Polling Application

A full-stack voting application for creating and participating in real-time polls, built with React and Node.js.

## Features

- **User Authentication**: Secure user registration and login
- **Poll Creation**: Create polls with multiple options
- **Real-time Voting**: See poll results update instantly using WebSockets
- **Poll Management**: Publish/unpublish and delete your own polls
- **Responsive Design**: Modern UI that works on all devices

## Technology Stack

**Frontend:** React, React Router, Zustand (state management), Socket.io Client
**Backend:** Node.js, Express.js, PostgreSQL, Prisma ORM, Socket.io, JWT

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- NPM package manager

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/RY-RahulYadav/poll-voting-system.git
cd poll-voting-system
```

### 2. Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the backend directory with:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/voting_db"
   JWT_SECRET="your-super-secret-jwt-key-here"
   PORT=5000
   NODE_ENV=development
   ```

4. **Setup database:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   ```

5. **Start backend server:**
   ```bash
   npm run dev
   ```
   Backend will run on http://localhost:5000

### 3. Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file (optional):**
   Create a `.env` file in the frontend directory if you need custom API URL:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:5173

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)

### Frontend (.env) - Optional
- `REACT_APP_API_URL`: Backend API base URL (default: http://localhost:5000/api)

## Usage

1. Open http://localhost:3000 in your browser
2. Register a new account or login
3. Create polls with multiple options
4. Share polls and see real-time vote updates
5. Manage your polls (publish/unpublish/delete)

