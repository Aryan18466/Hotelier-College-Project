import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Sparkles, Clock, CheckCircle2, User } from 'lucide-react';

const StaffServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services/requests');
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load guest service requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/services/requests/${id}`, { status });
      if (res.data.success) {
        toast.success(`Request marked as ${status}`);
        fetchRequests();
      }
    } catch (err) {
      toast.error('Failed to update request');
    }
  };

  const filtered = requests.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="container py-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <span className="badge bg-info bg-opacity-10 text-info mb-1">Guest Concierge Desk</span>
          <h3 className="font-serif fw-bold text-dark mb-0">Guest Service Requests</h3>
        </div>

        <div className="d-flex flex-wrap gap-2">
          {['all', 'pending', 'in_progress', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm text-capitalize ${
                statusFilter === st ? 'btn-charcoal' : 'btn-light border'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="card luxury-card p-4 border-0 bg-white shadow-sm">
        {loading ? (
          <div className="skeleton-box" style={{ height: '200px' }}></div>
        ) : filtered.length === 0 ? (
          <p className="text-muted small text-center py-4 m-0">No service requests found for this filter.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>Guest</th>
                  <th>Service Requested</th>
                  <th>Room / Destination</th>
                  <th>Notes / Request Details</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => (
                  <tr key={req._id}>
                    <td>
                      <strong className="text-dark d-block">{req.userId?.name}</strong>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{req.userId?.phone}</span>
                    </td>
                    <td>
                      <strong className="text-dark d-block">{req.serviceId?.name}</strong>
                      <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                        ₹{req.serviceId?.price?.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <div>Room #{req.roomId?.roomNumber}</div>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{req.hotelId?.name}</span>
                    </td>
                    <td className="text-muted">
                      {req.notes || 'No extra notes provided'}
                    </td>
                    <td>
                      <span className={`badge-status badge-status-${req.status}`}>{req.status}</span>
                    </td>
                    <td className="text-end">
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(req._id, 'in_progress')}
                          className="btn btn-outline-primary btn-sm py-0 px-2 me-1"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Accept
                        </button>
                      )}
                      {req.status !== 'completed' && (
                        <button
                          onClick={() => handleUpdateStatus(req._id, 'completed')}
                          className="btn btn-outline-success btn-sm py-0 px-2"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffServiceRequests;
