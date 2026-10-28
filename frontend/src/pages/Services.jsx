import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Sparkles, Utensils, Compass, Car, Wine, ShieldCheck, ArrowRight } from 'lucide-react';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        if (res.data.success) {
          setServices(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="py-5" style={{ backgroundColor: '#faf9f6' }}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <span className="badge badge-gold mb-2 text-uppercase" style={{ letterSpacing: '1.5px' }}>
            Exclusive Privileges
          </span>
          <h1 className="font-serif fw-bold display-5 mb-3">Curated Experiences & Services</h1>
          <p className="text-muted leading-relaxed">
            Elevate your stay with signature gastronomic journeys, tranquil Ayurvedic wellness therapies, and private
            chauffeur-driven mobility across India.
          </p>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="row g-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="col-md-6 col-lg-4">
                <div className="skeleton-box" style={{ height: '240px' }}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="row g-4 mb-5">
            {services.map((svc) => (
              <div key={svc._id} className="col-md-6 col-lg-4">
                <div className="card luxury-card p-4 border-0 bg-white h-100 d-flex flex-column justify-content-between shadow-sm">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="badge badge-gold text-capitalize">{svc.category}</span>
                      <strong className="text-dark fs-5">₹{svc.price.toLocaleString('en-IN')}</strong>
                    </div>

                    <h5 className="font-serif fw-bold text-dark mb-2">{svc.name}</h5>
                    <p className="text-muted small leading-relaxed mb-4">{svc.description}</p>
                  </div>

                  <div className="border-top pt-3 d-flex align-items-center justify-content-between text-muted small">
                    <span>Available at {svc.hotelId?.name}</span>
                    <Link to="/rooms" className="text-warning text-decoration-none fw-semibold">
                      Book with Stay →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bespoke Concierge Callout */}
        <div
          className="p-4 p-md-5 rounded text-white text-center shadow-sm"
          style={{ background: 'linear-gradient(135deg, #1e2022 0%, #2d3033 100%)', border: '1px solid #c5a880' }}
        >
          <span className="badge badge-gold mb-2 text-uppercase">Private Concierge</span>
          <h2 className="font-serif fw-bold text-white mb-2">Have a Custom Request or Celebration?</h2>
          <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '600px' }}>
            From private island sunset dinners to bespoke helicopter transfers and anniversary setups, our dedicated
            luxury concierge is at your service 24 hours a day.
          </p>
          <Link to="/contact" className="btn btn-gold px-4 py-2">
            Speak with Chief Concierge
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Services;
