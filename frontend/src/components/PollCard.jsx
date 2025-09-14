import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from '../utils/dateUtils';

export default function PollCard({ poll }) {
  const navigate = useNavigate();

  // Calculate total votes
  const totalVotes = poll.options.reduce(
    (sum, option) => sum + (option._count?.votes || 0), 
    0
  );

  const handleCardClick = () => {
    navigate(`/polls/${poll.id}`);
  };

  return (
    <div className="poll-card" onClick={handleCardClick}>
      <div className="inner">
        {poll.name && (
          <div style={{ fontSize: 17, fontWeight: 700, color: '#2563eb', marginBottom: 2 }}>{poll.name}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2 className="poll-title">{poll.question}</h2>
          <span className="badge">{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
        </div>

        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {poll.options.slice(0, 2).map((option) => {
            const pct = totalVotes > 0 
              ? Math.round(((option._count?.votes || 0) / totalVotes) * 100)
              : 0;
            return (
              <div key={option.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="progress" style={{ flex: 1 }}>
                  <div className="fill" style={{ width: `${pct}%` }}></div>
                </div>
                <span className="muted" style={{ fontSize: 12 }}>{pct}%</span>
              </div>
            );
          })}
          {poll.options.length > 2 && (
            <p className="muted" style={{ fontSize: 12 }}>+{poll.options.length - 2} more options</p>
          )}
        </div>

        <div className="poll-meta">
          <span>By {poll?.creator?.name}</span>
          <span>{formatDistanceToNow(new Date(poll.createdAt))} ago</span>
        </div>
        <div style={{ marginTop: 10, textAlign: 'right' }}>
          <a
            href={`/polls/${poll.id}`}
            onClick={e => { e.stopPropagation(); navigate(`/polls/${poll.id}`); }}
            style={{ color: '#2563eb', fontWeight: 600, fontSize: 14, textDecoration: 'underline', cursor: 'pointer' }}
          >
            Click Here For Vote
          </a>
        </div>
      </div>
    </div>
  );
}