import { useEffect, useState } from 'react';
import type { AuditLog } from '../types';
import { STATUS_LABELS } from '../types';
import { fetchAuditLogs } from '../api';

interface AuditLogModalProps {
  taskId: string;
  taskTitle: string;
  onClose: () => void;
}

export default function AuditLogModal({ taskId, taskTitle, onClose }: AuditLogModalProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs(taskId)
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [taskId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Audit Log</h2>
          <button className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <p className="modal-task-title">Task: <strong>{taskTitle}</strong></p>

        {loading ? (
          <p className="loading">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="empty-logs">No status changes recorded yet.</p>
        ) : (
          <div className="audit-log-list">
            {logs.map((log) => (
              <div key={log.id} className="audit-log-entry">
                <div className="log-actor">
                  <strong>{log.actor}</strong>
                </div>
                <div className="log-detail">
                  Changed status from{' '}
                  <span className="status-tag">{STATUS_LABELS[log.previousStatus]}</span>
                  {' → '}
                  <span className="status-tag">{STATUS_LABELS[log.newStatus]}</span>
                </div>
                <div className="log-time">{new Date(log.changedAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
