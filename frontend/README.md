# Real-Time Polling Application Frontend

This is the frontend for a real-time polling application built with React, Zustand, and Tailwind CSS.

## Features

- Modern and responsive UI with Tailwind CSS
- State management with Zustand
- Real-time updates of poll results using Socket.io
- Authentication and protected routes
- Form handling and validation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Backend server running

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:5173

## Project Structure

```
src/
  ├── assets/        # Static assets
  ├── components/    # Reusable UI components
  │   ├── Navbar.jsx
  │   ├── PollCard.jsx
  │   ├── PollVoteSection.jsx
  │   └── CreatePollForm.jsx
  ├── pages/         # Page components
  │   ├── HomePage.jsx
  │   ├── LoginPage.jsx
  │   ├── RegisterPage.jsx
  │   ├── PollsPage.jsx
  │   ├── PollDetailPage.jsx
  │   ├── CreatePollPage.jsx
  │   └── MyPollsPage.jsx
  ├── services/      # API services
  │   ├── api.js
  │   └── socketService.js
  ├── stores/        # State management
  │   ├── authStore.js
  │   ├── pollStore.js
  │   └── voteStore.js
  ├── utils/         # Utility functions
  │   └── dateUtils.js
  ├── App.jsx        # Main App component with routing
  └── main.jsx       # Application entry point
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build locally

## Dependencies

- **react** & **react-dom**: UI library
- **react-router-dom**: Client-side routing
- **zustand**: State management
- **axios**: HTTP client
- **socket.io-client**: WebSocket communication
- **@headlessui/react** & **@heroicons/react**: UI components
- **react-hot-toast**: Notifications
- **tailwindcss**: Utility-first CSS framework
