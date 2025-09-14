import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './stores/authStore';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PollsPage from './pages/PollsPage';
import PollDetailPage from './pages/PollDetailPage';
import CreatePollPage from './pages/CreatePollPage';
import MyPollsPage from './pages/MyPollsPage';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const { loadUser } = useAuthStore();

  // Load user data on app startup
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Router>
      <div className="app-root">
        <Navbar />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/polls" element={<PollsPage />} />
          <Route path="/polls/:id" element={<PollDetailPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/create-poll" 
            element={
              <ProtectedRoute>
                <CreatePollPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-polls" 
            element={
              <ProtectedRoute>
                <MyPollsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
