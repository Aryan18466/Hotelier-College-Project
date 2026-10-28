import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="py-5 text-center min-vh-70 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#faf9f6' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="brand-font display-1 fw-bold text-muted opacity-50 mb-2">404</div>
        <h2 className="font-serif fw-bold text-dark mb-3">Suite or Page Not Found</h2>
        <p className="text-secondary small leading-relaxed mb-4">
          The requested luxury destination, suite, or portal route could not be found or may have moved.
        </p>
        <Link to="/" className="btn btn-gold px-4 py-2 d-inline-flex align-items-center gap-2">
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
