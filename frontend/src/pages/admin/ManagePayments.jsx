import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { CreditCard, CheckCircle, RefreshCcw, ShieldCheck } from 'lucide-react';

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments');
      if (res.data.success) {
        setPayments(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load transaction ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="container py-2">
      <div className="mb-4">
        <span className="badge badge-gold mb-1">Financial Reconciliation</span>
        <h3 className="font-serif fw-bold text-dark mb-0">Payment Audit & Transactions</h3>
        <p className="text-muted small m-0">Verified transaction logs, gateway signatures, and captured revenue ledger.</p>
      </div>

      <div className="card luxury-card p-4 border-0 bg-white shadow-sm">
        {loading ? (
          <div className="skeleton-box" style={{ height: '220px' }}></div>
        ) : payments.length === 0 ? (
          <p className="text-muted small text-center py-4 m-0">No payment transactions recorded.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>Transaction ID</th>
                  <th>Booking Ref</th>
                  <th>Guest Account</th>
                  <th>Gateway Provider</th>
                  <th>Amount Captured</th>
                  <th>Status</th>
                  <th>Processed Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <span className="font-monospace fw-bold text-dark d-block">
                        {p.providerPaymentId || p._id}
                      </span>
                      <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                        Order: {p.providerOrderId || 'N/A'}
                      </small>
                    </td>
                    <td>
                      <span className="font-monospace fw-bold">
                        #{p.bookingId?.bookingReference || 'Reference'}
                      </span>
                    </td>
                    <td>
                      <strong>{p.userId?.name}</strong>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{p.userId?.email}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border text-uppercase">
                        {p.provider}
                      </span>
                    </td>
                    <td>
                      <strong className="text-success fs-6">
                        ₹{p.amount?.toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td>
                      <span className="badge bg-success bg-opacity-10 text-success text-capitalize">
                        {p.status}
                      </span>
                    </td>
                    <td>{new Date(p.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
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

export default ManagePayments;
