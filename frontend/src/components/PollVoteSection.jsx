import { useState, useEffect } from 'react';
import socketService from '../services/socketService';
import useVoteStore from '../stores/voteStore';
import useAuthStore from '../stores/authStore';

export default function PollVoteSection({ poll }) {
  const { isAuthenticated } = useAuthStore();
  const { submitVote, fetchPollResults, checkUserVote, pollResults, userVotes, isLoading } = useVoteStore();
  const [selectedOption, setSelectedOption] = useState(null);

  const results = pollResults[poll?.id] || [];
  const userVote = userVotes[poll?.id] || { hasVoted: false };
  const totalVotes = results.reduce((sum, option) => sum + option.voteCount, 0);

  useEffect(() => {
    if (poll?.id) {
      fetchPollResults(poll.id);
      if (isAuthenticated) {
        checkUserVote(poll.id);
      }
      socketService.joinPollRoom(poll.id);
      const socket = socketService.getSocket();
      const handlePollVote = (data) => {
        if (data.pollId === poll.id) {
          useVoteStore.getState().updatePollResults(poll.id, data.results);
        }
      };
      socket.on('poll-vote', handlePollVote);
      return () => {
        socket.off('poll-vote', handlePollVote);
        socketService.leavePollRoom(poll.id);
      };
    }
  }, [poll?.id, fetchPollResults, checkUserVote, isAuthenticated]);

  const handleVote = async () => {
    if (!selectedOption) return;
    try {
      await submitVote(selectedOption, poll.id);
    } catch (error) {
      console.error('Failed to submit vote:', error);
    }
  };

  const getPercentage = (voteCount) => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  };

  return (
    <div className="card">
      {!isAuthenticated ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', marginBottom: 12 }}>You need to log in to vote in this poll.</p>
          <a href="/login" className="btn btn-primary">Log In to Vote</a>
        </div>
      ) : userVote.hasVoted ? (
        <div>
          <h3 className="title" style={{ fontSize: 18 }}>Results</h3>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
            You voted for: <span style={{ fontWeight: 600, color: '#2563eb' }}>{userVote.optionText}</span>
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            {results.map((option) => (
              <div key={option.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600 }}>
                  <span style={{ color: option.id === userVote.optionId ? '#2563eb' : '#374151' }}>{option.text}</span>
                  <span>
                    {getPercentage(option.voteCount)}% ({option.voteCount} {option.voteCount === 1 ? 'vote' : 'votes'})
                  </span>
                </div>
                <div className="progress">
                  <div className="fill" style={{ width: `${getPercentage(option.voteCount)}%`, background: option.id === userVote.optionId ? '#2563eb' : '#93c5fd' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, textAlign: 'center', fontSize: 13, color: '#6b7280' }}>Total votes: {totalVotes}</div>
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
      {/* Always show results section below, even if 0 votes */}
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
    </div>
  );
}