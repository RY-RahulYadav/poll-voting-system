import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div>
      <section className="page" style={{ background: 'linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%)' }}>
        <div className="container" style={{ textAlign: 'center', padding: '60px 16px' }}>
          <h1 className="title" style={{ fontSize: 42 }}>Real-time polling made simple</h1>
          <p style={{ margin: '14px auto 0', maxWidth: 720, color: '#4b5563', fontSize: 18 }}>
            Create and share polls with your audience. Get immediate feedback with real-time results.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
            <Link to="/polls" className="btn btn-primary">View polls</Link>
            <Link to="/create-poll" className="btn btn-outline">Create a poll →</Link>
          </div>
        </div>
      </section>

      <section className="page">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 className="title" style={{ fontSize: 26 }}>Everything you need for interactive polling</h2>
            <p style={{ color: '#6b7280', maxWidth: 760, margin: '10px auto 0' }}>
              Whether you're gathering feedback, making decisions, or just having fun, our polling platform has you covered.
            </p>
          </div>

          <div className="polls-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            <div className="card">
              <div className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                ⚡ Real-time updates
              </div>
              <p style={{ marginTop: 10, color: '#374151' }}>
                See results update instantly as votes come in. No need to refresh the page.
              </p>
            </div>
            <div className="card">
              <div className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                🔒 Secure voting
              </div>
              <p style={{ marginTop: 10, color: '#374151' }}>
                Each user can only vote once per poll, ensuring fair and accurate results.
              </p>
            </div>
            <div className="card">
              <div className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                🔗 Simple sharing
              </div>
              <p style={{ marginTop: 10, color: '#374151' }}>
                Share your polls with anyone. No account needed to vote.
              </p>
            </div>
           
          </div>
        </div>
      </section>
    <footer style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14, margin: '32px 0 0 0', padding: '16px 0' }}>
      &copy; {new Date().getFullYear()} PollApp. All rights reserved.
    </footer>
  </div>
  );
}