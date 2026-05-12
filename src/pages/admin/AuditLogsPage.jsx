import { useEffect, useState } from 'react';
import authService from '../../services/authService';
import Loader from '../../components/common/Loader';

function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getAuditLogs()
      .then((data) => setLogs(data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading audit logs..." />;

  return (
    <div className="card border-0 shadow-sm p-4">
      <h4 className="fw-bold mb-3">Audit Logs</h4>
      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Actor</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.createdAt || '-'}</td>
                <td>{log.action}</td>
                <td>{log.entityType} #{log.entityId}</td>
                <td>{log.actorUserId || '-'}</td>
                <td>{log.details}</td>
              </tr>
            ))}
            {logs.length === 0 ? <tr><td colSpan="5" className="text-center text-muted py-4">No logs found</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditLogsPage;
