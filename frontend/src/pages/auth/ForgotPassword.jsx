import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Hotel, Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [devLink, setDevLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setDevLink('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        toast.success(res.data.message);
        if (res.data.devResetLink) {
          setDevLink(res.data.devResetLink);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process request');
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
          <h2 className="font-serif fw-bold text-dark mb-1">Reset Password</h2>
          <p className="text-muted small">Enter your account email to receive a password recovery link.</p>
        </div>

        <div className="card luxury-card p-4 border-0 bg-white shadow-sm mb-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Account Email</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Mail size={16} className="text-muted" />
                </span>
                <input
                  type="email"
                  className="form-control border-start-0"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-gold w-100 py-2 fw-bold" disabled={submitting}>
              {submitting ? 'Transmitting...' : 'Send Recovery Link'}
            </button>
          </form>

          {devLink && (
            <div className="alert alert-info mt-3 p-3 small text-break mb-0">
              <strong>Dev Mode Password Reset Link:</strong>
              <div className="mt-1">
                <a href={devLink} className="text-decoration-none fw-bold">
                  Click here to Reset Password
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link to="/login" className="text-muted small text-decoration-none d-inline-flex align-items-center gap-1">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
