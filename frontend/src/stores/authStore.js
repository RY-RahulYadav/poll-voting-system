import { create } from 'zustand';
import { login, register, getUserProfile } from '../services/api';

const getStoredUser = () => {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('userToken');
  
  if (storedUser && storedToken) {
    return { user: JSON.parse(storedUser), token: storedToken };
  }
  
  return { user: null, token: null };
};

const useAuthStore = create((set) => ({
  user: getStoredUser().user,
  token: getStoredUser().token,
  isAuthenticated: !!getStoredUser().token,
  isLoading: false,
  error: null,
  
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await register(userData);
      
      localStorage.setItem('user', JSON.stringify(response));
      localStorage.setItem('userToken', response.token);
      
      set({
        user: response,
        token: response.token,
        isAuthenticated: true,
        isLoading: false
      });
      
      return response;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        isLoading: false
      });
      throw error;
    }
  },
  
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await login(credentials);
      
      localStorage.setItem('user', JSON.stringify(response));
      localStorage.setItem('userToken', response.token);
      
      set({
        user: response,
        token: response.token,
        isAuthenticated: true,
        isLoading: false
      });
      
      return response;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false
      });
      throw error;
    }
  },
  
  loadUser: async () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return;
    }
    
    set({ isLoading: true });
    try {
      const userData = await getUserProfile();
      localStorage.setItem('user', JSON.stringify(userData));
      
      set({
        user: userData,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      localStorage.removeItem('user');
      localStorage.removeItem('userToken');
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session expired. Please log in again.'
      });
    }
  },
  
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null
    });
  },
  
  clearError: () => set({ error: null })
}));

export default useAuthStore;