import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { User, Lock, Save, ShieldCheck } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  // Profile Information State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', { name, phone, profileImage });
      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Profile details updated successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.warning('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.warning('New password must be at least 6 characters');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.put('/auth/password', { currentPassword, newPassword });
      if (res.data.success) {
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="container py-2" style={{ maxWidth: '800px' }}>
      <div className="mb-4">
        <h3 className="font-serif fw-bold text-dark mb-1">Personal Profile & Security</h3>
        <p className="text-muted small m-0">Manage your member profile details, contact preferences, and credentials.</p>
      </div>

      {/* Profile Details Card */}
      <div className="card luxury-card p-4 border-0 bg-white shadow-sm mb-4">
        <h5 className="font-serif fw-bold mb-3 d-flex align-items-center gap-2">
          <User size={18} className="text-warning" />
          <span>General Information</span>
        </h5>

        <form onSubmit={handleUpdateProfile}>
          <div className="row g-3">
            <div className="col-sm-6">
              <label className="form-label small fw-bold text-muted">Full Name</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="col-sm-6">
              <label className="form-label small fw-bold text-muted">Email Address (Registered)</label>
              <input type="email" className="form-control form-control-sm bg-light" value={user?.email || ''} disabled />
            </div>

            <div className="col-sm-6">
              <label className="form-label small fw-bold text-muted">Phone Number</label>
              <input
                type="tel"
                className="form-control form-control-sm"
                placeholder="+91 98765 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="col-sm-6">
              <label className="form-label small fw-bold text-muted">Profile Photo Image URL</label>
              <input
                type="url"
                className="form-control form-control-sm"
                placeholder="https://..."
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
              />
            </div>

            <div className="col-12 text-end mt-4">
              <button type="submit" className="btn btn-gold btn-sm d-inline-flex align-items-center gap-1" disabled={savingProfile}>
                <Save size={14} />
                <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Security & Password Card */}
      <div className="card luxury-card p-4 border-0 bg-white shadow-sm">
        <h5 className="font-serif fw-bold mb-3 d-flex align-items-center gap-2">
          <Lock size={18} className="text-warning" />
          <span>Security & Password</span>
        </h5>

        <form onSubmit={handleChangePassword}>
          <div className="row g-3">
            <div className="col-sm-4">
              <label className="form-label small fw-bold text-muted">Current Password</label>
              <input
                type="password"
                className="form-control form-control-sm"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="col-sm-4">
              <label className="form-label small fw-bold text-muted">New Password</label>
              <input
                type="password"
                className="form-control form-control-sm"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="col-sm-4">
              <label className="form-label small fw-bold text-muted">Confirm New Password</label>
              <input
                type="password"
                className="form-control form-control-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="col-12 text-end mt-4">
              <button type="submit" className="btn btn-outline-dark btn-sm d-inline-flex align-items-center gap-1" disabled={savingPassword}>
                <ShieldCheck size={14} />
                <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
