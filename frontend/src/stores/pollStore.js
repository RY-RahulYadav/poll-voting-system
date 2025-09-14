import { create } from 'zustand';
import { 
  getPolls, 
  getPollById, 
  createPoll, 
  updatePollStatus, 
  deletePoll, 
  getMyPolls 
} from '../services/api';

const usePollStore = create((set, get) => ({
  polls: [],
  userPolls: [],
  currentPoll: null,
  isLoading: false,
  error: null,
  
  // Fetch all public polls
  fetchPolls: async () => {
    set({ isLoading: true, error: null });
    try {
      const polls = await getPolls();
      set({ polls, isLoading: false });
      return polls;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch polls',
        isLoading: false
      });
      throw error;
    }
  },
  
  // Fetch a single poll by ID
  fetchPollById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const poll = await getPollById(id);
      set({ currentPoll: poll, isLoading: false });
      return poll;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch poll',
        isLoading: false
      });
      throw error;
    }
  },
  
  // Fetch polls created by the current user
  fetchUserPolls: async () => {
    set({ isLoading: true, error: null });
    try {
      const userPolls = await getMyPolls();
      set({ userPolls, isLoading: false });
      return userPolls;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch your polls',
        isLoading: false
      });
      throw error;
    }
  },
  
  // Create a new poll
  createNewPoll: async (pollData) => {
    set({ isLoading: true, error: null });
    try {
      const newPoll = await createPoll(pollData);
      set(state => ({
        userPolls: [newPoll, ...state.userPolls],
        isLoading: false
      }));
      return newPoll;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create poll',
        isLoading: false
      });
      throw error;
    }
  },
  
  // Update poll status (publish/unpublish)
  updatePollStatus: async (id, isPublished) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPoll = await updatePollStatus(id, { isPublished });
      
      // Update both polls and userPolls arrays
      set(state => ({
        polls: state.polls.map(poll => poll.id === id ? updatedPoll : poll),
        userPolls: state.userPolls.map(poll => poll.id === id ? updatedPoll : poll),
        currentPoll: state.currentPoll?.id === id ? updatedPoll : state.currentPoll,
        isLoading: false
      }));
      
      return updatedPoll;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update poll status',
        isLoading: false
      });
      throw error;
    }
  },
  
  // Delete a poll
  deletePoll: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deletePoll(id);
      
      // Remove poll from both arrays
      set(state => ({
        polls: state.polls.filter(poll => poll.id !== id),
        userPolls: state.userPolls.filter(poll => poll.id !== id),
        currentPoll: state.currentPoll?.id === id ? null : state.currentPoll,
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete poll',
        isLoading: false
      });
      throw error;
    }
  },
  
  // Update poll results (for real-time updates)
  updatePollResults: (pollId, results) => {
    set(state => {
      // If this is the current poll being viewed, update its options
      if (state.currentPoll && state.currentPoll.id === pollId) {
        const updatedOptions = state.currentPoll.options.map(option => {
          const resultData = results.find(r => r.id === option.id);
          return {
            ...option,
            _count: { votes: resultData ? resultData.voteCount : option._count.votes }
          };
        });
        
        return {
          currentPoll: {
            ...state.currentPoll,
            options: updatedOptions
          }
        };
      }
      return state;
    });
  },
  
  clearCurrentPoll: () => set({ currentPoll: null }),
  clearError: () => set({ error: null })
}));

export default usePollStore;