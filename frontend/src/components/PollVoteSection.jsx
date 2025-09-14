import { useState, useEffect } from 'react';
import socketService from '../services/socketService';
import useVoteStore from '../stores/voteStore';
import useAuthStore from '../stores/authStore';

export default function PollVoteSection({ poll }) {
  const { isAuthenticated, user } = useAuthStore();
  const { submitVote, fetchPollResults, checkUserVote, pollResults, userVotes, isLoading } = useVoteStore();
  const [selectedOption, setSelectedOption] = useState(null);
  // Keep local state of user's vote to ensure UI consistency
  const [hasVoted, setHasVoted] = useState(false);

  const results = pollResults[poll?.id] || [];
  const userVote = userVotes[poll?.id] || { hasVoted: false };
  const totalVotes = results.reduce((sum, option) => sum + option.voteCount, 0);

  // Effect to sync the local hasVoted state with the store's userVote
  useEffect(() => {
    // Check from store first
    if (userVote.hasVoted) {
      setHasVoted(true);
      // Also ensure it's saved to localStorage when detected from store
      try {
        const savedUserVotes = localStorage.getItem('userVotes') || '{}';
        const parsedVotes = JSON.parse(savedUserVotes);
        if (poll?.id && (!parsedVotes[poll.id] || !parsedVotes[poll.id].hasVoted)) {
          parsedVotes[poll.id] = { 
            ...userVote, 
            timestamp: Date.now(),
            confirmed: true 
          };
          localStorage.setItem('userVotes', JSON.stringify(parsedVotes));
        }
      } catch (error) {
        console.error("Error updating localStorage from userVote:", error);
      }
    }
    
    // Also check localStorage directly for this poll
    try {
      const savedUserVotes = localStorage.getItem('userVotes');
      if (savedUserVotes) {
        const parsedVotes = JSON.parse(savedUserVotes);
        if (poll?.id && parsedVotes[poll.id] && parsedVotes[poll.id].hasVoted) {
          setHasVoted(true);
          
          // Also sync back to the store for consistency
          if (!userVote.hasVoted) {
            useVoteStore.getState().updateUserVoteStatus(poll.id, parsedVotes[poll.id]);
          }
        }
      }
    } catch (error) {
      console.error("Error checking localStorage vote status:", error);
    }
  }, [userVote.hasVoted, poll?.id, userVote]);

  useEffect(() => {
    const loadData = async () => {
      if (poll?.id) {
        // Always fetch poll results
        await fetchPollResults(poll.id);
        
        // First check localStorage for maximum speed
        let hasStoredVote = false;
        try {
          const savedUserVotes = localStorage.getItem('userVotes');
          if (savedUserVotes) {
            const parsedVotes = JSON.parse(savedUserVotes);
            if (parsedVotes[poll.id]?.hasVoted) {
              console.log('Found vote in localStorage, setting hasVoted to true');
              setHasVoted(true);
              hasStoredVote = true;
              
              // Also sync back to the store if needed
              if (!userVotes[poll.id]?.hasVoted) {
                useVoteStore.getState().updateUserVoteStatus(poll.id, parsedVotes[poll.id]);
              }
            }
          }
        } catch (e) {
          console.error('Error checking localStorage:', e);
        }
        
        // Always check with server if authenticated, even if we found a local vote
        // This ensures our data is accurate
        if (isAuthenticated) {
          try {
            console.log('Checking vote status with server');
            const voteStatus = await checkUserVote(poll.id);
            console.log('Server vote status:', voteStatus);
            
            if (voteStatus.hasVoted) {
              console.log('Server confirms user has voted');
              setHasVoted(true);
              
              // Also update localStorage if the server says they voted
              try {
                const savedUserVotes = localStorage.getItem('userVotes') || '{}';
                const parsedVotes = JSON.parse(savedUserVotes);
                parsedVotes[poll.id] = {
                  ...voteStatus,
                  timestamp: Date.now(),
                  confirmed: true
                };
                localStorage.setItem('userVotes', JSON.stringify(parsedVotes));
              } catch (e) {
                console.error('Error updating localStorage:', e);
              }
            } else if (hasStoredVote) {
              // If we have a local vote but server says no, still keep hasVoted true
              // This prevents the UI from flickering between states
              console.log('Server says no vote but we have local vote, keeping hasVoted true');
            }
          } catch (error) {
            console.error('Error checking vote status:', error);
            // If API call fails but we have a local vote, still keep hasVoted true
            if (hasStoredVote) {
              setHasVoted(true);
            }
          }
        }
      }
    };
    
    loadData();
    
    if (poll?.id) {
      socketService.joinPollRoom(poll.id);
      const socket = socketService.getSocket();
      
      const handlePollVote = (data) => {
        if (data.pollId === poll.id) {
          // Always update the poll results when any vote comes in
          useVoteStore.getState().updatePollResults(poll.id, data.results);
          
          // If this is the current user's vote, update their vote status
          if (isAuthenticated && user && data.userId === user.id) {
            setHasVoted(true); // Set local state immediately
            useVoteStore.getState().updateUserVoteStatus(poll.id, {
              hasVoted: true,
              optionId: data.votedOptionId,
              optionText: data.votedOptionText
            });
          }
        }
      };
      
      socket.on('poll-vote', handlePollVote);
      
      return () => {
        socket.off('poll-vote', handlePollVote);
        socketService.leavePollRoom(poll.id);
      };
    }
  }, [poll?.id, fetchPollResults, checkUserVote, isAuthenticated, user]);

  const handleVote = async () => {
    if (!selectedOption) return;
    try {
      // Set local state immediately to prevent UI flicker
      setHasVoted(true);
      
      // Find the selected option
      const selectedOptionObj = poll.options.find(o => o.id === selectedOption);
      const selectedOptionText = selectedOptionObj?.text || '';
      
      // Create optimistic update for UI
      // Create a new array with all options and increment the vote count for the selected option
      const optimisticResults = [...poll.options].map(option => ({
        id: option.id,
        text: option.text,
        voteCount: option.id === selectedOption ? 1 : 0 // Start with 1 for selected, 0 for others
      }));
      
      // Update the local results state for immediate feedback
      useVoteStore.getState().updatePollResults(poll.id, optimisticResults);
      
      // Save to localStorage for persistence
      const voteData = {
        hasVoted: true,
        optionId: selectedOption,
        optionText: selectedOptionText,
        timestamp: Date.now()
      };
      
      // Save to localStorage
      try {
        const savedUserVotes = localStorage.getItem('userVotes') || '{}';
        const parsedVotes = JSON.parse(savedUserVotes);
        parsedVotes[poll.id] = voteData;
        localStorage.setItem('userVotes', JSON.stringify(parsedVotes));
        console.log('Vote saved to localStorage', { pollId: poll.id, voteData });
      } catch (e) {
        console.error('Error saving vote to localStorage:', e);
      }
      
      // Then submit to server
      const response = await submitVote(selectedOption, poll.id);
      console.log('Vote submitted to server, response:', response);
      
      // Force a re-fetch of results to ensure we have the most accurate counts
      await fetchPollResults(poll.id);
    } catch (error) {
      console.error('Failed to submit vote:', error);
      // Even if the API call fails, we don't revert the hasVoted state
      // This ensures the user doesn't see voting options again
      // If they refresh, the server check will determine if they actually voted
    }
  };

  const getPercentage = (voteCount) => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  };

  // Check localStorage directly before rendering
  const checkLocalStorageForVote = () => {
    try {
      const savedUserVotes = localStorage.getItem('userVotes');
      if (savedUserVotes && poll?.id) {
        const parsedVotes = JSON.parse(savedUserVotes);
        return parsedVotes[poll.id]?.hasVoted === true;
      }
    } catch (error) {
      console.error("Error checking localStorage vote status:", error);
    }
    return false;
  };

  // Force check localStorage every render for maximum reliability
  const localStorageHasVote = checkLocalStorageForVote();
  
  // Combine all vote status checks - forcing to boolean for safety
  // If ANY of these sources say the user has voted, we show results instead of voting options
  const userHasVoted = Boolean(hasVoted || userVote.hasVoted || localStorageHasVote);
  
  // Log vote status for debugging
  useEffect(() => {
    console.log('Vote status:', { 
      hasVotedState: hasVoted,
      userVoteHasVoted: userVote.hasVoted,
      localStorageHasVote,
      finalUserHasVoted: userHasVoted,
      pollId: poll?.id,
      results,
      totalVotes
    });
  }, [hasVoted, userVote.hasVoted, localStorageHasVote, userHasVoted, poll?.id, results, totalVotes]);

  // Always ensure we have at least one vote counted when the user has voted
  const adjustedResults = userHasVoted ? 
    results.map(option => ({
      ...option,
      // If user has voted and this is their option, ensure it has at least 1 vote
      voteCount: option.id === userVote.optionId ? Math.max(1, option.voteCount) : option.voteCount
    })) : results;
  
  // Debug the results and adjustment
  console.log('Results adjustment:', {
    originalResults: results,
    originalTotalVotes: totalVotes,
    userVoteOptionId: userVote.optionId,
    userHasVoted,
    adjustedResults
  });
  
  // Recalculate total votes based on adjusted results
  const adjustedTotalVotes = adjustedResults.reduce((sum, option) => sum + option.voteCount, 0);
  
  // Calculate percentages based on adjusted counts
  const getAdjustedPercentage = (voteCount) => {
    if (adjustedTotalVotes === 0) return 0;
    return Math.round((voteCount / adjustedTotalVotes) * 100);
  };

  return (
    <div className="card">
      {!isAuthenticated ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', marginBottom: 12 }}>You need to log in to vote in this poll.</p>
          <a href="/login" className="btn btn-primary">Log In to Vote</a>
        </div>
      ) : userHasVoted ? (
        <div>
          <h3 className="title" style={{ fontSize: 18 }}>Results</h3>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
            You voted for: <span style={{ fontWeight: 600, color: '#2563eb' }}>{userVote.optionText}</span>
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            {adjustedResults.map((option) => {
              // Always ensure at least 1 vote for the option user voted for
              const displayVoteCount = option.id === userVote.optionId ? Math.max(1, option.voteCount) : option.voteCount;
              
              // Ensure percentage is never 0% for the voted option
              const displayPercentage = option.id === userVote.optionId ? 
                Math.max(1, getAdjustedPercentage(displayVoteCount)) : 
                getAdjustedPercentage(displayVoteCount);
              
              console.log('Rendering option:', {
                optionId: option.id,
                originalVoteCount: option.voteCount,
                displayVoteCount,
                userVotedOption: userVote.optionId,
                isUserVote: option.id === userVote.optionId,
                percentage: displayPercentage
              });
              
              return (
                <div key={option.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600 }}>
                    <span style={{ color: option.id === userVote.optionId ? '#2563eb' : '#374151' }}>{option.text}</span>
                    <span>
                      {displayPercentage}% ({displayVoteCount} {displayVoteCount === 1 ? 'vote' : 'votes'})
                    </span>
                  </div>
                  <div className="progress">
                    <div className="fill" 
                      style={{ 
                        width: `${Math.max(1, displayPercentage)}%`, // Ensure bar is visible with minimum 1% width
                        background: option.id === userVote.optionId ? '#2563eb' : '#93c5fd' 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
            Total votes: {userHasVoted ? Math.max(1, adjustedTotalVotes) : adjustedTotalVotes} 
            {/* Always ensure at least 1 total vote is shown when user has voted */}
          </div>
        </div>
      ) : (
        <div>
          <h3 className="title" style={{ fontSize: 18 }}>Cast your vote</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {poll.options.map((option) => (
              <label key={option.id} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#374151' }}>
                <input
                  id={`option-${option.id}`}
                  name="poll-option"
                  type="radio"
                  className="checkbox"
                  value={option.id}
                  checked={selectedOption === option.id}
                  onChange={() => setSelectedOption(option.id)}
                />
                {option.text}
              </label>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!selectedOption || isLoading}
              onClick={handleVote}
            >
              {isLoading ? 'Submitting...' : 'Submit Vote'}
            </button>
          </div>
        </div>
      )}
      {/* If user has voted, we already show full results above.
          If not authenticated or has not voted, show public results. */}
      {!userHasVoted && (
        <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
          <h3 className="title" style={{ fontSize: 18 }}>Current Results</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {results.map((option) => (
              <div key={option.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, color: '#374151' }}>
                  <span>{option.text}</span>
                  <span>{getPercentage(option.voteCount)}%</span>
                </div>
                <div className="progress">
                  <div className="fill" style={{ width: `${getPercentage(option.voteCount)}%`, background: '#93c5fd' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, textAlign: 'center', fontSize: 13, color: '#6b7280' }}>Total votes: {totalVotes}</div>
        </div>
      )}
    </div>
  );
}