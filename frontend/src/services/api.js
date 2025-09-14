import axios from 'axios';

// Create an axios instance with base URL
// For Vite or similar build tools, use import.meta.env; fallback to localhost if not set
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// AUTH SERVICES
export const register = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// POLL SERVICES
export const createPoll = async (pollData) => {
  const response = await api.post('/polls', pollData);
  return response.data;
};

export const getPolls = async () => {
  const response = await api.get('/polls');
  return response.data;
};

export const getPollById = async (id) => {
  const response = await api.get(`/polls/${id}`);
  return response.data;
};

export const updatePollStatus = async (id, data) => {
  const response = await api.put(`/polls/${id}`, data);
  return response.data;
};

export const deletePoll = async (id) => {
  const response = await api.delete(`/polls/${id}`);
  return response.data;
};

export const getMyPolls = async () => {
  const response = await api.get('/polls/user/my-polls');
  return response.data;
};

// VOTE SERVICES
export const createVote = async (voteData) => {
  const response = await api.post('/votes', voteData);
  return response.data;
};

export const getPollResults = async (pollId) => {
  const response = await api.get(`/votes/results/${pollId}`);
  return response.data;
};

export const checkUserVote = async (pollId) => {
  const response = await api.get(`/votes/check/${pollId}`);
  return response.data;
};

export default api;