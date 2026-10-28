import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Hotel, Lock, ArrowRight } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.warning('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.warning('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.put(`/auth/reset-password/${token}`, { password });
      if (res.data.success) {
        toast.success('Password successfully reset! Please sign in with your new credentials.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired token');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-5" style={{ backgroundColor: '#faf9f6', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '460px' }}>
        <div className="text-center mb-4">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              background: '#1e2022',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c5a880',
              marginBottom: '1rem',
            }}
          >
            <Hotel size={24} />
          </div>
          <h2 className="font-serif fw-bold text-dark mb-1">Set New Password</h2>
          <p className="text-muted small">Choose a secure password of at least 6 characters.</p>
        </div>

        <div className="card luxury-card p-4 border-0 bg-white shadow-sm mb-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">New Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Lock size={16} className="text-muted" />
                </span>
                <input
                  type="password"
                  className="form-control border-start-0"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">Confirm New Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Lock size={16} className="text-muted" />
                </span>
                <input
                  type="password"
                  className="form-control border-start-0"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-gold w-100 py-2 fw-bold" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Password & Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
