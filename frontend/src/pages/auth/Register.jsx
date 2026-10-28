import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Hotel, User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.warning('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.warning('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      const res = await register(formData);
      toast.success(`Welcome to Hotelier, ${res.user.name}!`);
      navigate('/guest');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-5" style={{ backgroundColor: '#faf9f6', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="text-center mb-4">
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              background: '#1e2022',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c5a880',
              marginBottom: '1rem',
            }}
          >
            <Hotel size={26} />
          </div>
          <h2 className="font-serif fw-bold text-dark mb-1">Create Guest Account</h2>
          <p className="text-muted small">Join Hotelier to explore sample stays, reservations, and guest privileges in this demo.</p>
        </div>

        <div className="card luxury-card p-4 p-md-5 border-0 bg-white shadow-sm mb-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Full Name</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <User size={16} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="e.g. Vikram Malhotra"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Mail size={16} className="text-muted" />
                </span>
                <input
                  type="email"
                  className="form-control border-start-0"
                  placeholder="vikram@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Phone Number</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Phone size={16} className="text-muted" />
                </span>
                <input
                  type="tel"
                  className="form-control border-start-0"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Lock size={16} className="text-muted" />
                </span>
                <input
                  type="password"
                  className="form-control border-start-0"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-gold w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
              disabled={submitting}
            >
              <span>{submitting ? 'Registering...' : 'Complete Registration'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <div className="text-center text-muted small">
          Already have an account?{' '}
          <Link to="/login" className="text-warning fw-bold text-decoration-none">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
