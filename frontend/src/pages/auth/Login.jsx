import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Hotel, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after login
  const query = new URLSearchParams(location.search);
  const redirect = query.get('redirect');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter both email and password');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(email, password);
      toast.success(`Welcome back, ${res.user.name}!`);

      if (redirect) {
        navigate(redirect);
      } else if (res.user.role === 'admin') {
        navigate('/admin');
      } else if (res.user.role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/guest');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
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
          <h2 className="font-serif fw-bold text-dark mb-1">Sign In to Hotelier</h2>
          <p className="text-muted small">Access your bookings, profile settings, and exclusive member privileges.</p>
        </div>

        <div className="card luxury-card p-4 p-md-5 border-0 bg-white shadow-sm mb-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Email Address</label>
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

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-bold text-muted m-0">Password</label>
                <Link to="/forgot-password" className="small text-warning text-decoration-none" style={{ fontSize: '0.75rem' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Lock size={16} className="text-muted" />
                </span>
                <input
                  type="password"
                  className="form-control border-start-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-gold w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 mb-3"
              disabled={submitting}
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Demo Account Quick-Fill Buttons */}
          <div className="border-top pt-3 mt-2 text-center">
            <span className="small text-muted d-block mb-2 fw-semibold">Quick-Fill Demo Credentials:</span>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('guest@hotelpro.com', 'Guest@123')}
                className="btn btn-outline-secondary btn-sm py-1 px-2"
                style={{ fontSize: '0.72rem' }}
              >
                Guest Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('staff@hotelpro.com', 'Staff@123')}
                className="btn btn-outline-primary btn-sm py-1 px-2"
                style={{ fontSize: '0.72rem' }}
              >
                Staff Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@hotelpro.com', 'Admin@123')}
                className="btn btn-outline-danger btn-sm py-1 px-2"
                style={{ fontSize: '0.72rem' }}
              >
                Admin Demo
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-muted small">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-warning fw-bold text-decoration-none">
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
