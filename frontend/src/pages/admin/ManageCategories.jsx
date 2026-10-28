import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Layers, Plus, Trash2, Edit2 } from 'lucide-react';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 7500,
    adults: 2,
    children: 1,
    amenities: 'King Bed, Wi-Fi, Mini Bar, City View',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load room categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        basePrice: Number(formData.basePrice),
        capacity: {
          adults: Number(formData.adults),
          children: Number(formData.children),
        },
        amenities: formData.amenities.split(',').map((a) => a.trim()),
      };

      const res = await api.post('/categories', payload);
      if (res.data.success) {
        toast.success('Category created successfully!');
        setShowModal(false);
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="badge badge-gold mb-1">Configuration</span>
          <h3 className="font-serif fw-bold text-dark mb-0">Room Categories & Suites</h3>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-gold btn-sm d-flex align-items-center gap-1">
          <Plus size={16} />
          <span>New Category</span>
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
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Standard Capacity</th>
                  <th>Base Nightly Price</th>
                  <th>Amenities Included</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <strong className="text-dark d-block fs-6">{c.name}</strong>
                    </td>
                    <td className="text-muted" style={{ maxWidth: '300px' }}>
                      {c.description}
                    </td>
                    <td>
                      {c.capacity?.adults} Adults, {c.capacity?.children} Children
                    </td>
                    <td className="fw-bold fs-6">₹{c.basePrice?.toLocaleString('en-IN')}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {(c.amenities || []).slice(0, 3).map((a, i) => (
                          <span key={i} className="badge bg-light text-secondary border">
                            {a}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title font-serif fw-bold">New Suite Category</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Category Title</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Royal Heritage Villa"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
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

                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <label className="form-label small fw-bold text-muted">Base Rate (₹)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={formData.basePrice}
                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-bold text-muted">Adults</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={formData.adults}
                        onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-bold text-muted">Children</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={formData.children}
                        onChange={(e) => setFormData({ ...formData, children: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">Amenities (Comma separated)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={formData.amenities}
                      onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-gold btn-sm" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Category'}
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

export default ManageCategories;
