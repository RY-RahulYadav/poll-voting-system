import CreatePollForm from '../components/CreatePollForm';

export default function CreatePollPage() {
  return (
    <div className="container page" style={{ maxWidth: 780 }}>
      <h1 className="title" style={{ marginBottom: 16 }}>Create a New Poll</h1>
      <div className="card">
        <CreatePollForm />
      </div>
    </div>
  );
}