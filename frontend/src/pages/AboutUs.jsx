import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ShieldCheck, Heart, Sparkles, MapPin } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="py-5" style={{ backgroundColor: '#faf9f6' }}>
      <div className="container">
        {/* Banner */}
        <div className="row justify-content-center text-center mb-5">
          <div className="col-lg-8">
            <span className="badge badge-gold mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>
              The Hotelier Concept
            </span>
            <h1 className="font-serif fw-bold display-5 mb-3">Redefining Modern Luxury Hospitality</h1>
            <p className="lead text-muted">
              Hotelier is a luxury hospitality concept for this full-stack project, bringing together illustrative stays across India
              with the convenience of a modern reservation experience.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="row g-5 align-items-center mb-5">
          <div className="col-lg-6">
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
              alt="Hotel Heritage"
              className="img-fluid rounded shadow-sm"
              style={{ maxHeight: '420px', width: '100%', objectFit: 'cover' }}
            />
          </div>
          <div className="col-lg-6">
            <span className="text-uppercase small fw-bold text-warning" style={{ letterSpacing: '1px' }}>
              Our Story
            </span>
            <h2 className="font-serif fw-bold text-dark mt-1 mb-3">Where Royal Splendor Meets Intuitive Care</h2>
            <p className="text-secondary leading-relaxed mb-3">
              Inspired by India’s varied destinations, the concept showcases three illustrative flagship settings: the lakeside
              elegance of Udaipur, the coastal calm of Goa, and the contemporary energy of Mumbai. Property stories and
              contact details on this site are sample content created for the project demo.
            </p>
            <p className="text-secondary leading-relaxed mb-4">
              The experience emphasizes thoughtfully presented suites, curated local experiences, and attentive service—from room
              discovery and reservations to the guest and staff workflows demonstrated in this application.
            </p>
            <div className="row g-3">
              <div className="col-sm-6">
                <div className="p-3 bg-white rounded border">
                  <h3 className="font-serif fw-bold text-dark mb-0">3</h3>
                  <small className="text-muted">Illustrative Indian Destinations</small>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="p-3 bg-white rounded border">
                  <h3 className="font-serif fw-bold text-dark mb-0">One</h3>
                  <small className="text-muted">Unified Demo Experience</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card luxury-card p-4 border-0 bg-white h-100 shadow-sm text-center">
              <div
                className="rounded-circle bg-light d-inline-flex p-3 mx-auto mb-3 text-warning"
                style={{ width: 60, height: 60, alignItems: 'center', justifyContent: 'center' }}
              >
                <Sparkles size={28} />
              </div>
              <h5 className="font-serif fw-bold text-dark mb-2">Uncompromising Elegance</h5>
              <p className="text-muted small m-0">
                Handcrafted Italian marble, bespoke California King bedding, and museum-grade art grace every private suite.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card luxury-card p-4 border-0 bg-white h-100 shadow-sm text-center">
              <div
                className="rounded-circle bg-light d-inline-flex p-3 mx-auto mb-3 text-warning"
                style={{ width: 60, height: 60, alignItems: 'center', justifyContent: 'center' }}
              >
                <Heart size={28} />
              </div>
              <h5 className="font-serif fw-bold text-dark mb-2">Intuitive Personal Care</h5>
              <p className="text-muted small m-0">
                Our concierges and butlers take pride in recognizing personal guest preferences from arrival to departure.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card luxury-card p-4 border-0 bg-white h-100 shadow-sm text-center">
              <div
                className="rounded-circle bg-light d-inline-flex p-3 mx-auto mb-3 text-warning"
                style={{ width: 60, height: 60, alignItems: 'center', justifyContent: 'center' }}
              >
                <ShieldCheck size={28} />
              </div>
              <h5 className="font-serif fw-bold text-dark mb-2">Security & Transparency</h5>
              <p className="text-muted small m-0">
                Security-focused flows, room availability checks, and clear policy screens are demonstrated within the project.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/rooms" className="btn btn-gold px-4 py-2">
            Explore All Suites & Accommodations
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
