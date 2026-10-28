import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { History, Shield, Terminal } from 'lucide-react';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/audit-logs');
        if (res.data.success) {
          setLogs(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load system audit trails');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="container py-2">
      <div className="mb-4">
        <span className="badge badge-gold mb-1">Compliance & Security</span>
        <h3 className="font-serif fw-bold text-dark mb-0">System Audit Logs</h3>
        <p className="text-muted small m-0">Immutable records of administrative and security events.</p>
      </div>

      <div className="card luxury-card p-4 border-0 bg-white shadow-sm">
        {loading ? (
          <div className="skeleton-box" style={{ height: '220px' }}></div>
        ) : logs.length === 0 ? (
          <p className="text-muted small text-center py-4 m-0">No audit logs recorded yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle small mb-0 font-monospace">
              <thead className="table-light">
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Entity Type</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="text-muted" style={{ whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td>
                      <span className="badge bg-dark">{log.action}</span>
                    </td>
                    <td>
                      {log.actorId ? (
                        <div>
                          <strong>{log.actorId.name}</strong>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {log.actorId.role}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted">System</span>
                      )}
                    </td>
                    <td>{log.entityType}</td>
                    <td className="text-truncate" style={{ maxWidth: '280px' }}>
                      {JSON.stringify(log.details || {})}
                    </td>
                    <td className="text-muted">{log.ipAddress || '127.0.0.1'}</td>
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

export default AuditLogsPage;
