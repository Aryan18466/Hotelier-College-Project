import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Sparkles, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const GuestServices = () => {
  const [services, setServices] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Request Modal State
  const [selectedService, setSelectedService] = useState(null);
  const [bookingId, setBookingId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesRes, requestsRes, bookingsRes] = await Promise.all([
        api.get('/services'),
        api.get('/services/requests'),
        api.get('/bookings/my?status=confirmed'),
      ]);

      if (servicesRes.data.success) setServices(servicesRes.data.data);
      if (requestsRes.data.success) setMyRequests(requestsRes.data.data);
      if (bookingsRes.data.success) {
        setActiveBookings(bookingsRes.data.data);
        if (bookingsRes.data.data.length > 0) {
          setBookingId(bookingsRes.data.data[0]._id);
        }
      }
    } catch (err) {
      toast.error('Failed to load guest services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestService = async (e) => {
    e.preventDefault();
    if (!bookingId || !selectedService) {
      toast.warning('Please select an active reservation to attach this service to');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/services/request', {
        bookingId,
        serviceId: selectedService._id,
        notes,
      });

      if (res.data.success) {
        toast.success(`Request for ${selectedService.name} received! Our team will assist promptly.`);
        setSelectedService(null);
        setNotes('');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit service request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-2">
      <div className="mb-4">
        <h3 className="font-serif fw-bold text-dark mb-1">Experiences & In-Suite Services</h3>
        <p className="text-muted small m-0">Request personal dining, luxury chauffeur transit, or wellness spa treatments directly to your suite.</p>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-lg-8">
          <h5 className="font-serif fw-bold mb-3">Available Services & Privileges</h5>

          {loading ? (
            <div className="skeleton-box" style={{ height: '200px' }}></div>
          ) : (
            <div className="row g-3">
              {services.map((svc) => (
                <div key={svc._id} className="col-md-6">
                  <div className="card luxury-card p-3 border-0 bg-white h-100 d-flex flex-column justify-content-between shadow-sm">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="badge badge-gold text-capitalize">{svc.category}</span>
                        <span className="fw-bold text-dark">₹{svc.price.toLocaleString('en-IN')}</span>
                      </div>
                      <h6 className="font-serif fw-bold text-dark mb-1">{svc.name}</h6>
                      <p className="text-secondary small mb-3">{svc.description}</p>
                    </div>

                    <button
                      className="btn btn-outline-gold btn-sm w-100"
                      onClick={() => setSelectedService(svc)}
                      disabled={activeBookings.length === 0}
                    >
                      {activeBookings.length === 0 ? 'Requires Active Stay' : 'Request Service'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Track Requested Services */}
        <div className="col-lg-4">
          <div className="card luxury-card p-4 border-0 bg-white shadow-sm">
            <h5 className="font-serif fw-bold mb-3">My Service History</h5>

            {myRequests.length === 0 ? (
              <p className="text-muted small m-0">No active or previous service requests.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {myRequests.map((req) => (
                  <div key={req._id} className="p-3 rounded border bg-light small">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className="text-dark">{req.serviceId?.name}</strong>
                      <span className={`badge-status badge-status-${req.status}`}>{req.status}</span>
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Room #{req.roomId?.roomNumber} • ₹{req.serviceId?.price?.toLocaleString('en-IN')}
                    </div>
                    {req.notes && <div className="text-secondary mt-1 fst-italic">"{req.notes}"</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {selectedService && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title font-serif fw-bold">Request {selectedService.name}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedService(null)}></button>
              </div>
              <form onSubmit={handleRequestService}>
                <div className="modal-body">
                  <p className="text-muted small">{selectedService.description}</p>
                  <div className="badge badge-gold mb-3">Price: ₹{selectedService.price.toLocaleString('en-IN')}</div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Select Active Reservation / Room</label>
                    <select
                      className="form-select form-select-sm"
                      value={bookingId}
                      onChange={(e) => setBookingId(e.target.value)}
                      required
                    >
                      {activeBookings.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.hotelId?.name} – Room #{b.roomId?.roomNumber} (#{b.bookingReference})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Time / Special Instructions</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="3"
                      placeholder="e.g. Please arrange for 8:30 PM tonight, 2 guests"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => setSelectedService(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-gold btn-sm" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Confirm Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestServices;
