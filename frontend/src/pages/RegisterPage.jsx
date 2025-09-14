import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuthStore from '../stores/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      toast.success('Registration successful!');
      navigate('/polls');
    } catch (err) {
      toast.error(error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={{ height: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 24px', overflow: 'hidden' }}>
      <div className="card" style={{ maxWidth: 400, width: '100%', padding: '20px 32px 20px 32px', borderRadius: 18, boxShadow: '0 8px 32px rgba(60,60,120,0.10)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#2563eb22', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 28, color: '#2563eb', fontWeight: 900 }}>📝</span>
          </div>
          <h2 className="title" style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Create a new account</h2>
          <p style={{ color: '#6b7280', marginTop: 6, fontSize: 14 }}>
            Or <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>sign in to your account</Link>
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label htmlFor="name" className="label" style={{ fontWeight: 600, fontSize: 14 }}>Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="input"
              style={{ fontSize: 15, padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', marginTop: 3, width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label htmlFor="email" className="label" style={{ fontWeight: 600, fontSize: 14 }}>Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="input"
              style={{ fontSize: 15, padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', marginTop: 3, width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label htmlFor="password" className="label" style={{ fontWeight: 600, fontSize: 14 }}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="input"
              style={{ fontSize: 15, padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', marginTop: 3, width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label htmlFor="confirmPassword" className="label" style={{ fontWeight: 600, fontSize: 14 }}>Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input"
              style={{ fontSize: 15, padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', marginTop: 3, width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          {error && <div className="error-box" style={{ marginBottom: 10 }}>{error}</div>}
          <div className="form-actions" style={{ marginTop: 8 }}>
            <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ width: '100%', padding: '10px 0', fontSize: 16, borderRadius: 8, fontWeight: 700 }}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}