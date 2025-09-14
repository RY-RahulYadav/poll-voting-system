import { create } from 'zustand';
import { createVote, getPollResults, checkUserVote } from '../services/api';

const useVoteStore = create((set, get) => ({
  pollResults: {},
  userVotes: {}, // Map of pollId -> { hasVoted, optionId, optionText }
  isLoading: false,
  error: null,
  
  // Submit a vote for a poll option
  submitVote: async (pollOptionId, pollId) => {
    set({ isLoading: true, error: null });
    
    // Get current state for optimistic update
    const currentState = get();
    const currentResults = currentState.pollResults[pollId] || [];
    
    // Find the option being voted for
    const votedOption = currentResults.find(r => r.id === pollOptionId);
    
    // Optimistically update the UI immediately
    const optimisticResults = currentResults.map(option => 
      option.id === pollOptionId 
        ? { ...option, voteCount: option.voteCount + 1 }
        : option
    );
    
    // Immediately update the state for instant UI feedback
    set(state => ({
      userVotes: {
        ...state.userVotes,
        [pollId]: {
          hasVoted: true,
          optionId: pollOptionId,
          optionText: votedOption?.text || ''
        }
      },
      pollResults: {
        ...state.pollResults,
        [pollId]: optimisticResults
      }
    }));
    
    try {
      const response = await createVote({ pollOptionId });
      
      // Update with actual server response
      set(state => ({
        userVotes: {
          ...state.userVotes,
          [pollId]: {
            hasVoted: true,
            optionId: pollOptionId,
            optionText: response.results.find(r => r.id === pollOptionId)?.text || ''
          }
        },
        pollResults: {
          ...state.pollResults,
          [pollId]: response.results
        },
        isLoading: false
      }));
      
      return response;
    } catch (error) {
      // Revert optimistic update on error
      set(state => ({
        userVotes: {
          ...state.userVotes,
          [pollId]: { hasVoted: false }
        },
        pollResults: {
          ...state.pollResults,
          [pollId]: currentResults
        },
        error: error.response?.data?.message || 'Failed to submit vote',
        isLoading: false
      }));
      throw error;
    }
  },
  
  // Fetch poll results
  fetchPollResults: async (pollId) => {
    set({ isLoading: true, error: null });
    try {
      const results = await getPollResults(pollId);
      
      set(state => ({
        pollResults: {
          ...state.pollResults,
          [pollId]: results
        },
        isLoading: false
      }));
      
      return results;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch poll results',
        isLoading: false
      });
      throw error;
    }
  },
  
  // Check if the current user has voted on a poll
  checkUserVote: async (pollId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await checkUserVote(pollId);
      
      set(state => ({
        userVotes: {
          ...state.userVotes,
          [pollId]: response
        },
        isLoading: false
      }));
      
      return response;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to check vote status',
        isLoading: false
      });
      throw error;
    }
  },
  
  // Update poll results from socket
  updatePollResults: (pollId, results) => {
    set(state => ({
      pollResults: {
        ...state.pollResults,
        [pollId]: results
      }
    }));
  },
  
  clearError: () => set({ error: null })
}));

export default useVoteStore;