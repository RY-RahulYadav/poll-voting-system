import { create } from 'zustand';
import { createVote, getPollResults, checkUserVote } from '../services/api';

// Helper to save user votes to localStorage
const loadUserVotesFromStorage = () => {
  try {
    const saved = localStorage.getItem('userVotes');
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.error('Failed to load user votes from storage:', e);
    return {};
  }
};

// Helper to save user votes to localStorage
const saveUserVotesToStorage = (userVotes) => {
  try {
    localStorage.setItem('userVotes', JSON.stringify(userVotes));
  } catch (e) {
    console.error('Failed to save user votes to storage:', e);
  }
};

const useVoteStore = create((set, get) => ({
  pollResults: {},
  userVotes: loadUserVotesFromStorage(), // Load initial state from localStorage
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
    // Ensure the voted option has at least 1 vote
    const optimisticResults = currentResults.map(option => {
      if (option.id === pollOptionId) {
        return { ...option, voteCount: Math.max(1, (option.voteCount || 0) + 1) };
      }
      return option;
    });
    
    // If the results are empty (no options found), create a default one for the selected option
    if (!votedOption && pollOptionId) {
      optimisticResults.push({
        id: pollOptionId,
        voteCount: 1
      });
    }
    
    // Store vote status with timestamp to prevent expiration
    const voteData = {
      hasVoted: true,
      optionId: pollOptionId,
      optionText: votedOption?.text || '',
      timestamp: Date.now() // Add timestamp for tracking
    };
    
    // Immediately update the state for instant UI feedback
    set(state => ({
      userVotes: {
        ...state.userVotes,
        [pollId]: voteData
      },
      pollResults: {
        ...state.pollResults,
        [pollId]: optimisticResults
      }
    }));
    
    try {
      const response = await createVote({ pollOptionId });
      console.log('Server response for createVote:', response);
      
      // Get the option text from the server response
      const serverVotedOption = response.results?.find(r => r.id === pollOptionId);
      const updatedVoteData = {
        hasVoted: true,
        optionId: pollOptionId,
        optionText: serverVotedOption?.text || votedOption?.text || '',
        timestamp: Date.now(),
        confirmed: true // Mark as confirmed by server
      };
      
      // Process the server results to ensure vote counts are correct
      const serverResults = response.results || [];
      const processedResults = serverResults.map(option => {
        // Ensure option has at least 1 vote if it's the one the user voted for
        if (option.id === pollOptionId && option.voteCount === 0) {
          return { ...option, voteCount: 1 };
        }
        return option;
      });
      
      // If user's voted option isn't in server results, add it
      if (!processedResults.some(option => option.id === pollOptionId)) {
        processedResults.push({
          id: pollOptionId,
          text: votedOption?.text || updatedVoteData.optionText,
          voteCount: 1
        });
      }
      
      // Update with actual server response
      set(state => {
        const newUserVotes = {
          ...state.userVotes,
          [pollId]: updatedVoteData
        };
        
        // Save to localStorage immediately
        saveUserVotesToStorage(newUserVotes);
        
        return {
          userVotes: newUserVotes,
          pollResults: {
            ...state.pollResults,
            [pollId]: processedResults
          },
          isLoading: false
        };
      });
      
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
      // First check if we have a cached vote in the store
      const currentState = get();
      const existingVote = currentState.userVotes[pollId];
      
      // Get the latest vote status from the server
      const response = await checkUserVote(pollId);
      
      // If server says the user has voted, store that with a timestamp
      if (response.hasVoted) {
        const updatedVoteData = {
          ...response,
          timestamp: Date.now(),
          confirmed: true
        };
        
        set(state => {
          const newUserVotes = {
            ...state.userVotes,
            [pollId]: updatedVoteData
          };
          
          // Save to localStorage immediately
          saveUserVotesToStorage(newUserVotes);
          
          return {
            userVotes: newUserVotes,
            isLoading: false
          };
        });
        
        return updatedVoteData;
      } else if (existingVote && existingVote.hasVoted) {
        // If server says no vote but we have a local cached vote,
        // keep the local vote info (in case of server sync issues)
        return existingVote;
      } else {
        // Otherwise update with server response
        set(state => {
          const newUserVotes = {
            ...state.userVotes,
            [pollId]: response
          };
          
          // Save to localStorage immediately
          saveUserVotesToStorage(newUserVotes);
          
          return {
            userVotes: newUserVotes,
            isLoading: false
          };
        });
        
        return response;
      }
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
  
  // Update user vote status (used by socket event handler)
  updateUserVoteStatus: (pollId, voteData) => {
    // Add timestamp and confirmed flag for persistence
    const enhancedVoteData = {
      ...voteData,
      timestamp: Date.now(),
      confirmed: true
    };
    
    set(state => {
      const newUserVotes = {
        ...state.userVotes,
        [pollId]: enhancedVoteData
      };
      
      // Save to localStorage immediately
      saveUserVotesToStorage(newUserVotes);
      
      return {
        userVotes: newUserVotes
      };
    });
  },
  
  clearError: () => set({ error: null })
}));

// We're saving to localStorage directly in our state updates,
// so we don't need a separate subscription

export default useVoteStore;