import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PollCard from '../components/PollCard';
import usePollStore from '../stores/pollStore';

export default function MyPollsPage() {
  const { userPolls, fetchUserPolls, isLoading, error } = usePollStore();

  useEffect(() => {
    fetchUserPolls();
  }, [fetchUserPolls]);

  return (
    <div className="container page">
      <div className="section-header">
        <h2 className="title">My Polls</h2>
        <Link to="/create-poll" className="btn btn-primary">Create Poll</Link>
      </div>

      {isLoading ? (
        <div className="spinner" />
      ) : error ? (
        <div className="error-box">{error}</div>
      ) : userPolls.length === 0 ? (
        <div className="card empty-state">
          <div className="emoji">📭</div>
          <h3>No polls yet</h3>
          <p>You haven't created any polls yet.</p>
          <Link to="/create-poll" className="btn btn-outline">Create your first poll</Link>
        </div>
      ) : (
        <div className="polls-grid">
          {userPolls.map(poll => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}