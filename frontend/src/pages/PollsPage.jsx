import { useEffect } from 'react';
import PollCard from '../components/PollCard';
import usePollStore from '../stores/pollStore';

export default function PollsPage() {
  const { polls, fetchPolls, isLoading, error } = usePollStore();

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  return (
    <div className="container page">
      <div className="section-header">
        <h2 className="title">Public Polls</h2>
      </div>

      {isLoading ? (
        <div className="spinner" />
      ) : error ? (
        <div className="error-box">{error}</div>
      ) : polls.length === 0 ? (
        <div className="card empty-state">
          <div className="emoji">🙂</div>
          <h3>No polls found</h3>
          <p>There are no polls available at the moment.</p>
        </div>
      ) : (
        <div className="polls-grid">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}