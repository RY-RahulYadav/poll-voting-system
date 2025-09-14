import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import usePollStore from '../stores/pollStore';
import useAuthStore from '../stores/authStore';
import PollVoteSection from '../components/PollVoteSection';
import { formatDistanceToNow } from '../utils/dateUtils';

export default function PollDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentPoll, fetchPollById, updatePollStatus, deletePoll, isLoading, error } = usePollStore();
  const { user } = useAuthStore();

  const isOwner = currentPoll && user && currentPoll.creator.id === user.id;

  useEffect(() => {
    fetchPollById(id);
  }, [id, fetchPollById]);

  const [statusLoading, setStatusLoading] = useState(false);
  // Track the displayed publish state separately for immediate UI updates
  const [displayedPublishState, setDisplayedPublishState] = useState(null);
  
  useEffect(() => {
    if (currentPoll) {
      setDisplayedPublishState(currentPoll.isPublished);
    }
  }, [currentPoll]);

  const handleStatusToggle = async () => {
    if (statusLoading) return; // Prevent multiple clicks during loading
    
    setStatusLoading(true);
    const prev = currentPoll.isPublished;
    // Immediately update the displayed state for better UX
    setDisplayedPublishState(!prev);
    
    try {
      await updatePollStatus(id, !prev);
      toast.success(`Poll ${prev ? 'unpublished' : 'published'} successfully!`);
    } catch (err) {
      // Revert displayed state on error
      setDisplayedPublishState(prev);
      toast.error(error || 'Failed to update poll status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this poll?')) {
      return;
    }

    try {
      await deletePoll(id);
      toast.success('Poll deleted successfully!');
      navigate('/my-polls');
    } catch (err) {
      toast.error(error || 'Failed to delete poll');
    }
  };

  if (isLoading) {
    return <div className="spinner" />;
  }

  if (error) {
    return (
      <div className="container page" style={{ maxWidth: 780 }}>
        <div className="error-box">{error}</div>
      </div>
    );
  }

  if (!currentPoll) {
    return (
      <div className="container page" style={{ maxWidth: 780 }}>
        <div className="card empty-state">
          <h3>Poll not found</h3>
          <p>The poll you're looking for doesn't exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container page" style={{ maxWidth: 780 }}>
      <div className="card" style={{ padding: 0 }}>
        <div className="inner" style={{ padding: 20, borderBottom: '1px solid #e5e7eb' }}>
          {currentPoll.name && (
            <div style={{ fontSize: 20, fontWeight: 700, color: '#2563eb', marginBottom: 4 }}>{currentPoll.name}</div>
          )}
          <h2 className="title" style={{ fontSize: 24 }}>{currentPoll.question}</h2>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', fontSize: 14 }}>
              <span>Created by <span style={{ color: '#111827', fontWeight: 600 }}>{currentPoll.creator.name}</span></span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(currentPoll.createdAt))} ago</span>
            </div>
            {isOwner && (
              <div style={{ display: 'flex', gap: 8,  alignItems: 'center' }}>
                <a  className="">
                  {displayedPublishState ? 'Published' : 'Unpublished'}
                </a>
               
                <button
                  onClick={handleStatusToggle}
                  className={`btn ${displayedPublishState ? 'btn-blue' : 'btn-blue'}`}
                  style={{
                    borderRadius: 999,
                    borderWidth: 2,
                    borderStyle: 'solid',
                    borderColor: displayedPublishState ? '#2563eb' : 'transparent',
                    color: displayedPublishState ? '#2563eb' : '#fff',
                    background: displayedPublishState ? '#fff' : '#2563eb',
                    fontWeight: 600,
                    minWidth: 110,
                    boxShadow: 'none',
                    outline: displayedPublishState ? '1.5px solid #2563eb' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {statusLoading ? (
                    <>
                      <span className="spinner" style={{ width: 22, height: 22, margin: 0, marginRight: 6 }} />
                      {displayedPublishState ? 'Unpublishing...' : 'Publishing...'}
                    </>
                  ) : (
                    displayedPublishState ? 'Unpublish' : 'Publish'
                  )}
                </button>
                <button onClick={handleDelete} className="btn btn-danger">
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: 20 }}>
          <PollVoteSection poll={currentPoll} />
        </div>
      </div>
    </div>
  );
}