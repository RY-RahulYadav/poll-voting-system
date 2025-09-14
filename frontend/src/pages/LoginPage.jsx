import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(formData);
      toast.success('Login successful!');
      navigate('/polls');
    } catch (err) {
      toast.error(error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
      <div className="card" style={{ maxWidth: 400, width: '100%', padding: '32px 32px 32px 32px', borderRadius: 18, boxShadow: '0 8px 32px rgba(60,60,120,0.10)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#2563eb22', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 36, color: '#2563eb', fontWeight: 900 }}>🔒</span>
          </div>
          <h2 className="title" style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Sign in to your account</h2>
          <p style={{ color: '#6b7280', marginTop: 8, fontSize: 15 }}>
            Or <Link to="/register" style={{ color: '#2563eb', fontWeight: 600 }}>create a new account</Link>
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 18 }}>
            <label htmlFor="email" className="label" style={{ fontWeight: 600 }}>Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="input"
              style={{ fontSize: 16, padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', marginTop: 4, width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 18 }}>
            <label htmlFor="password" className="label" style={{ fontWeight: 600 }}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="input"
              style={{ fontSize: 16, padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', marginTop: 4, width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          {error && <div className="error-box" style={{ marginBottom: 14 }}>{error}</div>}
          <div className="form-actions" style={{ marginTop: 10 }}>
            <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', padding: '12px 0', fontSize: 17, borderRadius: 8, fontWeight: 700 }}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}