import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Hotel, Plus, Trash2, Edit2, Star, MapPin } from 'lucide-react';

const ManageHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Hotel Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    address: '',
    city: 'Udaipur',
    starRating: 5,
    amenities: 'Infinity Pool, Luxury Spa, Valet Parking, Wi-Fi',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hotels');
      if (res.data.success) {
        setHotels(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleCreateHotel = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        starRating: Number(formData.starRating),
        amenities: formData.amenities.split(',').map((a) => a.trim()),
        images: [formData.image],
      };

      const res = await api.post('/hotels', payload);
      if (res.data.success) {
        toast.success('Hotel property created successfully!');
        setShowModal(false);
        fetchHotels();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create hotel');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this hotel?')) return;
    try {
      const res = await api.delete(`/hotels/${id}`);
      if (res.data.success) {
        toast.success('Hotel property deactivated');
        fetchHotels();
      }
    } catch (err) {
      toast.error('Failed to deactivate hotel');
    }
  };

  return (
    <div className="container py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="badge badge-gold mb-1">Portfolio</span>
          <h3 className="font-serif fw-bold text-dark mb-0">Hotel Properties</h3>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-gold btn-sm d-flex align-items-center gap-1">
          <Plus size={16} />
          <span>Add New Hotel</span>
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
                  <th>Hotel Name</th>
                  <th>Location</th>
                  <th>Rating</th>
                  <th>Policies</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((h) => (
                  <tr key={h._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={h.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=150&q=80'}
                          alt={h.name}
                          className="rounded"
                          style={{ width: 44, height: 44, objectFit: 'cover' }}
                        />
                        <div>
                          <strong className="text-dark d-block">{h.name}</strong>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>{h.tagline}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1 text-secondary">
                        <MapPin size={14} className="text-warning" />
                        <span>{h.city}, India</span>
                      </div>
                      <small className="text-muted d-block">{h.address}</small>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1 text-warning">
                        <Star size={14} fill="#c5a880" stroke="#c5a880" />
                        <span className="fw-bold text-dark">{h.starRating} Stars</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        In: {h.policies?.checkInTime} • Out: {h.policies?.checkOutTime}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${h.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {h.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => handleDeactivate(h._id)}
                        className="btn btn-sm btn-link text-danger p-0 ms-2"
                        title="Deactivate Property"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Hotel Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title font-serif fw-bold">Add Luxury Hotel Property</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateHotel}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">Hotel Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Hotelier Royal Pavilion"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">Tagline</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Timeless Royal Splendor"
                        value={formData.tagline}
                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">City</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">Address</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Street, District"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted">Description</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="3"
                        placeholder="Detailed overview of architecture, location, and guest experience..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      ></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">Amenities (Comma separated)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.amenities}
                        onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">Primary Image URL</label>
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-gold btn-sm" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Property'}
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

export default ManageHotels;
