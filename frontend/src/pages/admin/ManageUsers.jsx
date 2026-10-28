import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Users, Search, Shield, Briefcase, UserCheck, UserX } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const res = await api.put(`/admin/users/${userId}`, { isActive: !currentStatus });
      if (res.data.success) {
        toast.success(`User account ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchUsers();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}`, { role: newRole });
      if (res.data.success) {
        toast.success(`Role changed to ${newRole}`);
        fetchUsers();
      }
    } catch (err) {
      toast.error('Failed to change role');
    }
  };

  return (
    <div className="container py-2">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <span className="badge badge-gold mb-1">Access Control</span>
          <h3 className="font-serif fw-bold text-dark mb-0">User & Staff Accounts</h3>
        </div>

        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="guest">Guests</option>
            <option value="staff">Staff</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      <div className="card luxury-card p-4 border-0 bg-white shadow-sm">
        {loading ? (
          <div className="skeleton-box" style={{ height: '220px' }}></div>
        ) : users.length === 0 ? (
          <p className="text-muted small text-center py-4 m-0">No users found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>User Profile</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th>Created</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={
                            u.profileImage ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                          }
                          alt={u.name}
                          className="rounded-circle"
                          style={{ width: 36, height: 36, objectFit: 'cover' }}
                        />
                        <div>
                          <strong className="text-dark d-block">{u.name}</strong>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{u.phone || 'Not provided'}</td>
                    <td>
                      <select
                        className="form-select form-select-sm py-0"
                        style={{ width: '110px', fontSize: '0.75rem' }}
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                      >
                        <option value="guest">Guest</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? 'bg-success' : 'bg-danger'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="text-end">
                      <button
                        onClick={() => handleToggleStatus(u._id, u.isActive)}
                        className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'} py-0 px-2`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
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

export default ManageUsers;
