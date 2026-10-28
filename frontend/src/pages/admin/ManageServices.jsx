import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Sparkles, Plus, Trash2 } from 'lucide-react';

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    hotelId: '',
    name: '',
    description: '',
    price: 3500,
    category: 'wellness',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [svcRes, hotRes] = await Promise.all([
        api.get('/services'),
        api.get('/hotels'),
      ]);

      if (svcRes.data.success) setServices(svcRes.data.data);
      if (hotRes.data.success) {
        setHotels(hotRes.data.data);
        if (hotRes.data.data.length > 0) {
          setFormData((prev) => ({ ...prev, hotelId: hotRes.data.data[0]._id }));
        }
      }
    } catch (err) {
      toast.error('Failed to load hotel services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/services', {
        ...formData,
        price: Number(formData.price),
      });

      if (res.data.success) {
        toast.success('Experience service added successfully!');
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create service');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="badge badge-gold mb-1">Guest Experiences</span>
          <h3 className="font-serif fw-bold text-dark mb-0">Hotel Services & Amenities</h3>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-gold btn-sm d-flex align-items-center gap-1">
          <Plus size={16} />
          <span>Add Service</span>
        </button>
      </div>

      <div className="card luxury-card p-4 border-0 bg-white shadow-sm">
        {loading ? (
          <div className="skeleton-box" style={{ height: '200px' }}></div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>Service Title</th>
                  <th>Category</th>
                  <th>Hotel Destination</th>
                  <th>Price</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <strong className="text-dark d-block">{s.name}</strong>
                    </td>
                    <td>
                      <span className="badge badge-gold text-capitalize">{s.category}</span>
                    </td>
                    <td>{s.hotelId?.name}</td>
                    <td className="fw-bold">₹{s.price?.toLocaleString('en-IN')}</td>
                    <td className="text-muted" style={{ maxWidth: '300px' }}>
                      {s.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title font-serif fw-bold">New Hotel Experience Service</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Hotel Property</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.hotelId}
                      onChange={(e) => setFormData({ ...formData, hotelId: e.target.value })}
                      required
                    >
                      {hotels.map((h) => (
                        <option key={h._id} value={h._id}>
                          {h.name} ({h.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Service Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Royal Candlelight Boat Dinner"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted">Price (₹)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted">Category</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="dining">Dining & Beverage</option>
                        <option value="wellness">Spa & Wellness</option>
                        <option value="transport">Chauffeur & Transit</option>
                        <option value="housekeeping">Extra Housekeeping</option>
                        <option value="other">Bespoke Experience</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Description</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-gold btn-sm" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Service'}
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

export default ManageServices;
