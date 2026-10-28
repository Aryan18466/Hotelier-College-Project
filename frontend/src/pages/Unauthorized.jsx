import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="py-5 text-center min-vh-70 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#faf9f6' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div
          className="rounded-circle bg-danger bg-opacity-10 d-inline-flex p-3 text-danger mb-3"
          style={{ width: 68, height: 68, alignItems: 'center', justifyContent: 'center' }}
        >
          <ShieldAlert size={36} />
        </div>
        <h2 className="font-serif fw-bold text-dark mb-2">Access Denied</h2>
        <p className="text-secondary small leading-relaxed mb-4">
          You do not possess the authorized administrative or operational credentials required to access this portal page.
        </p>
        <Link to="/" className="btn btn-outline-dark px-4 py-2 d-inline-flex align-items-center gap-2">
          <ArrowLeft size={16} /> Return to Public Portal
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
