import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast.success('Demo inquiry submitted. No message was sent or stored.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: '',
      });
      setSubmitting(false);
    }, 800);
  };

  return (
    <div className="py-5" style={{ backgroundColor: '#faf9f6' }}>
      <div className="container">
        <div className="text-center mb-5" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <span className="badge badge-gold mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>
            Concierge Desk
          </span>
          <h1 className="font-serif fw-bold display-5 mb-2">Connect with Hotelier</h1>
          <p className="text-muted">
            Explore our India-wide luxury hospitality concept for getaways, celebrations, and tailored guest experiences. The contact channels below are illustrative demo details.
          </p>
        </div>

        <div className="row g-5">
          {/* Contact Details */}
          <div className="col-lg-5">
            <div className="card luxury-card p-4 p-md-5 border-0 bg-white shadow-sm h-100">
              <h4 className="font-serif fw-bold text-dark mb-2">Demo Contact Details</h4>
              <p className="text-muted small mb-4">These fictional details are for the project demo only. No calls or emails are monitored.</p>

              <div className="d-flex flex-column gap-4">
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 rounded bg-light border text-warning flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <strong className="text-dark d-block">Illustrative Destinations</strong>
                    <span className="text-secondary small d-block">Udaipur, Goa & Mumbai, India</span>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 rounded bg-light border text-warning flex-shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <strong className="text-dark d-block">Demo Concierge Line</strong>
                    <span className="text-secondary small d-block">+91 00000 00000 (fictional, not connected)</span>
                    <span className="text-secondary small d-block">No live telephone service is configured.</span>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 rounded bg-light border text-warning flex-shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <strong className="text-dark d-block">Demo Email Addresses</strong>
                    <span className="text-secondary small d-block">concierge@hotelier.example</span>
                    <span className="text-secondary small d-block">reservations@hotelier.example</span>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 rounded bg-light border text-warning flex-shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <strong className="text-dark d-block">Service Model</strong>
                    <span className="text-secondary small d-block">Illustrative 24/7 concierge concept (not a live desk)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="col-lg-7">
            <div className="card luxury-card p-4 p-md-5 border-0 bg-white shadow-sm">
              <h4 className="font-serif fw-bold text-dark mb-2">Try the Contact Form</h4>
              <p className="text-muted small mb-4">Demo interaction only. Form submissions are not transmitted or stored.</p>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Your Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Rahul Verma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Enter your phone number (optional)"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Inquiry Subject</label>
                    <select
                      className="form-select"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Suite Reservation">Suite Reservation Assistance</option>
                      <option value="Private Event">Wedding or Private Event</option>
                      <option value="Corporate Booking">Corporate Conference</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Message / Special Requirements</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="How may our concierge team assist you today?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="col-12 mt-4">
                    <button
                      type="submit"
                      className="btn btn-gold w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                      disabled={submitting}
                    >
                      <Send size={16} />
                      <span>{submitting ? 'Simulating Submission...' : 'Simulate Inquiry Submission'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
