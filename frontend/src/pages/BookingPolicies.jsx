import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';

const BookingPolicies = () => {
  return (
    <div className="py-5" style={{ backgroundColor: '#faf9f6' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        <div className="text-center mb-5">
          <span className="badge badge-gold mb-2 text-uppercase">Terms of Stay</span>
          <h1 className="font-serif fw-bold display-5 mb-2">Booking & Cancellation Policies</h1>
          <p className="text-muted">
            We value clarity and peace of mind. Please review our hospitality and cancellation guarantees below.
          </p>
        </div>

        <div className="card luxury-card p-4 p-md-5 border-0 bg-white shadow-sm mb-4">
          {/* Section 1 */}
          <div className="mb-5">
            <h4 className="font-serif fw-bold text-dark d-flex align-items-center gap-2 mb-3">
              <ShieldCheck size={22} className="text-warning" />
              <span>1. Flexible Cancellation Policy</span>
            </h4>
            <div className="p-3 bg-light rounded border text-secondary small mb-3">
              <strong className="text-dark d-block mb-1">Standard Guarantee:</strong>
              Reservations cancelled <strong>48 hours or more prior to scheduled check-in time</strong> are entitled to a{' '}
              <strong>100% full refund</strong> back to the original payment method without penalty.
            </div>
            <ul className="text-secondary small leading-relaxed">
              <li>
                <strong>Cancellations within 48 Hours:</strong> Cancellations received less than 48 hours before arrival
                are subject to a 50% retention charge.
              </li>
              <li>
                <strong>No-Shows / Same-Day Cancellations:</strong> The full reservation amount is retained.
              </li>
              <li>
                <strong>Refund Processing:</strong> Approved refunds are credited to your bank or card account within 2
                to 5 business days.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="mb-5">
            <h4 className="font-serif fw-bold text-dark d-flex align-items-center gap-2 mb-3">
              <Clock size={22} className="text-warning" />
              <span>2. Check-In & Check-Out Timelines</span>
            </h4>
            <div className="row g-3 small text-secondary">
              <div className="col-sm-6">
                <div className="p-3 rounded border bg-light">
                  <strong className="text-dark d-block">Standard Check-In</strong>
                  <span>From 14:00 (2:00 PM) local hotel time. Early check-in subject to room readiness.</span>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="p-3 rounded border bg-light">
                  <strong className="text-dark d-block">Standard Check-Out</strong>
                  <span>Until 11:00 AM local hotel time. Late departure may be arranged with front desk.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="mb-4">
            <h4 className="font-serif fw-bold text-dark d-flex align-items-center gap-2 mb-3">
              <FileText size={22} className="text-warning" />
              <span>3. Identification & Payment Security</span>
            </h4>
            <p className="text-secondary small leading-relaxed">
              Per government regulations, all guests aged 18 and older must present an official government photo identity card
              (Aadhaar Card, Passport, Voter ID, or Driving License) upon arrival at reception desk. PAN cards are not accepted
              as address proof.
            </p>
            <p className="text-secondary small leading-relaxed m-0">
              Payments depend on the gateway configured for this project demo. Do not enter real payment credentials unless you have verified the payment environment.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link to="/rooms" className="btn btn-gold px-4 py-2">
            Back to Available Rooms
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingPolicies;
