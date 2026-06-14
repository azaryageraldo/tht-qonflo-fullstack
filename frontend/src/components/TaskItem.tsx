import type { Task, TaskStatus } from '../types';
import { STATUS_LABELS, VALID_TRANSITIONS } from '../types';

interface TaskItemProps {
  task: Task;
  selectedActor: string;
  onStatusChange: (taskId: string, newStatus: TaskStatus, actor: string) => void;
  onDelete: (taskId: string) => void;
  onViewLogs: (taskId: string) => void;
}

export default function TaskItem({
  task,
  selectedActor,
  onStatusChange,
  onDelete,
  onViewLogs,
}: TaskItemProps) {
  const nextStatus = VALID_TRANSITIONS[task.status];

  const statusColors: Record<TaskStatus, string> = {
    to_do: '#6b7280',
    pending: '#f59e0b',
    in_progress: '#3b82f6',
    done: '#10b981',
  };

  return (
    <div className="task-item">
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <span className="status-badge" style={{ backgroundColor: statusColors[task.status] }}>
          {STATUS_LABELS[task.status]}
        </span>
      </div>

      <div className="task-meta">
        <span className="task-date">Created: {new Date(task.createdAt).toLocaleString()}</span>
      </div>

      <div className="task-actions">
        {nextStatus && (
          <button
            className="btn btn-secondary"
            onClick={() => onStatusChange(task.id, nextStatus, selectedActor)}
          >
            Move to {STATUS_LABELS[nextStatus]}
          </button>
        )}

        <button className="btn btn-info" onClick={() => onViewLogs(task.id)}>
          Audit Log
        </button>

        <button className="btn btn-danger" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
