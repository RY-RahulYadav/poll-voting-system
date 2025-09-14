import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import usePollStore from '../stores/pollStore';

export default function CreatePollForm() {
  const navigate = useNavigate();
  const { createNewPoll, isLoading, error } = usePollStore();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isPublished, setIsPublished] = useState(true);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    } else {
      toast.error('You can add a maximum of 10 options');
    }
  };

  const removeOption = (indexToRemove) => {
    if (options.length > 2) {
      setOptions(options.filter((_, index) => index !== indexToRemove));
    } else {
      toast.error('A poll must have at least 2 options');
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const validOptions = options.filter((option) => option.trim() !== '');
    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }

    try {
      const pollData = {
        question: question.trim(),
        options: validOptions,
        isPublished,
      };

      const newPoll = await createNewPoll(pollData);
      toast.success('Poll created successfully!');
      navigate(`/polls/${newPoll.id}`);
    } catch (err) {
      toast.error(error || 'Failed to create poll');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '0 24px' }}>
      <div className="form-group">
        <label htmlFor="question" className="label">
          Poll Question
        </label>
        <input
          type="text"
          id="question"
          name="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="input"
          placeholder="What do you want to ask?"
          required
          style={{ width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      <div className="form-group">
        <label className="label">Poll Options</label>

        <div style={{ display: 'grid', gap: 10 }}>
          {options.map((option, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="input"
                placeholder={`Option ${index + 1}`}
                required
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
              {index >= 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="icon-btn"
                  style={{ marginLeft: 8 }}
                  aria-label={`Remove option ${index + 1}`}
                >
                  <MinusIcon className="icon-20" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" onClick={addOption} className="btn btn-ghost" style={{ marginTop: 10 }}>
          <PlusIcon className="icon-20" />
          Add Option
        </button>
      </div>

      <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
        <input
          id="published"
          name="published"
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="checkbox"
        />
        <label htmlFor="published" className="label" style={{ margin: 0, marginLeft: 8, fontWeight: 500 }}>
          Publish poll immediately
        </label>
      </div>

      <div className="form-actions">
        <button type="button" onClick={() => navigate('/my-polls')} className="btn btn-outline">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? 'Creating...' : 'Create Poll'}
        </button>
      </div>
    </form>
  );
}