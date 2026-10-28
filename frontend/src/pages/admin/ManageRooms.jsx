import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { BedDouble, Plus, Trash2, Edit2, Users, MapPin } from 'lucide-react';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Room Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    hotelId: '',
    roomNumber: '',
    categoryId: '',
    floor: 1,
    price: 8500,
    discountPercentage: 0,
    adults: 2,
    children: 1,
    amenities: 'King Bed, Lake View, Wi-Fi, Nespresso Machine, Mini Bar',
    imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, hotelsRes, catsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/hotels'),
        api.get('/categories'),
      ]);

      if (roomsRes.data.success) setRooms(roomsRes.data.data);
      if (hotelsRes.data.success) {
        setHotels(hotelsRes.data.data);
        if (hotelsRes.data.data.length > 0) {
          setFormData((prev) => ({ ...prev, hotelId: hotelsRes.data.data[0]._id }));
        }
      }
      if (catsRes.data.success) {
        setCategories(catsRes.data.data);
        if (catsRes.data.data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: catsRes.data.data[0]._id }));
        }
      }
    } catch (err) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!formData.roomNumber) {
      toast.warning('Please specify room number');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        hotelId: formData.hotelId,
        roomNumber: formData.roomNumber,
        categoryId: formData.categoryId,
        floor: Number(formData.floor),
        price: Number(formData.price),
        discountPercentage: Number(formData.discountPercentage),
        capacity: {
          adults: Number(formData.adults),
          children: Number(formData.children),
        },
        amenities: formData.amenities.split(',').map((a) => a.trim()),
        images: [formData.imageUrl],
      };

      const res = await api.post('/rooms', payload);
      if (res.data.success) {
        toast.success(`Room #${formData.roomNumber} created successfully!`);
        setShowModal(false);
        setFormData({ ...formData, roomNumber: '' });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this room?')) return;
    try {
      const res = await api.delete(`/rooms/${id}`);
      if (res.data.success) {
        toast.success('Room deactivated');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to deactivate room');
    }
  };

  return (
    <div className="container py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="badge badge-gold mb-1">Inventory</span>
          <h3 className="font-serif fw-bold text-dark mb-0">Manage Rooms & Suites</h3>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-gold btn-sm d-flex align-items-center gap-1">
          <Plus size={16} />
          <span>Add New Room</span>
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
                  <th>Room</th>
                  <th>Category</th>
                  <th>Hotel Property</th>
                  <th>Capacity</th>
                  <th>Nightly Rate</th>
                  <th>Operational Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={r.images[0] || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=150&q=80'}
                          alt={r.roomNumber}
                          className="rounded"
                          style={{ width: 40, height: 40, objectFit: 'cover' }}
                        />
                        <div>
                          <strong className="text-dark d-block">Room #{r.roomNumber}</strong>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Floor {r.floor}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-gold">{r.categoryId?.name || 'Suite'}</span>
                    </td>
                    <td>
                      <div>{r.hotelId?.name}</div>
                      <small className="text-muted">{r.hotelId?.city}</small>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1 text-secondary">
                        <Users size={14} />
                        <span>{r.capacity?.adults} Adults, {r.capacity?.children} Ch.</span>
                      </div>
                    </td>
                    <td>
                      <strong>₹{r.price?.toLocaleString('en-IN')}</strong>
                      {r.discountPercentage > 0 && (
                        <span className="badge bg-danger ms-1" style={{ fontSize: '0.65rem' }}>
                          -{r.discountPercentage}%
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge-status badge-status-${r.status}`}>{r.status}</span>
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => handleDeactivate(r._id)}
                        className="btn btn-sm btn-link text-danger p-0"
                        title="Deactivate Room"
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

      {/* Add Room Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title font-serif fw-bold">Add Luxury Room</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateRoom}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
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

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">Room Category</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        required
                      >
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name} (Base ₹{c.basePrice})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-muted">Room Number</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. 305 or V-02"
                        value={formData.roomNumber}
                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-muted">Floor Number</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={formData.floor}
                        onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-muted">Nightly Price (₹)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-muted">Discount % (0-100)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={formData.discountPercentage}
                        onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-muted">Adults Capacity</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={formData.adults}
                        onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-muted">Children Capacity</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={formData.children}
                        onChange={(e) => setFormData({ ...formData, children: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted">Amenities (Comma separated)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.amenities}
                        onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted">Image URL</label>
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-gold btn-sm" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Room'}
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

export default ManageRooms;
