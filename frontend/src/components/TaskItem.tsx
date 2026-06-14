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

  const statusStyles: Record<TaskStatus, { bg: string; color: string }> = {
    to_do: { bg: 'var(--status-todo-bg)', color: 'var(--status-todo)' },
    pending: { bg: 'var(--status-pending-bg)', color: 'var(--status-pending)' },
    in_progress: { bg: 'var(--status-progress-bg)', color: 'var(--status-progress)' },
    done: { bg: 'var(--status-done-bg)', color: 'var(--status-done)' },
  };

  const style = statusStyles[task.status];

  if (task.isDeleted) {
    return (
      <div className="task-item task-deleted">
        <div className="task-header">
          <h3 className="task-title">{task.title}</h3>
          <span className="status-badge status-badge-deleted">Dihapus</span>
        </div>

        <div className="task-meta">
          <span className="task-date">Dibuat: {new Date(task.createdAt).toLocaleString('id-ID')}</span>
        </div>

        <div className="task-actions">
          <button className="btn btn-info" onClick={() => onViewLogs(task.id)}>
            Log Aktivitas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-item">
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <span
          className="status-badge"
          style={{ backgroundColor: style.bg, color: style.color }}
        >
          {STATUS_LABELS[task.status]}
        </span>
      </div>

      <div className="task-meta">
        <span className="task-date">Dibuat: {new Date(task.createdAt).toLocaleString('id-ID')}</span>
      </div>

      <div className="task-actions">
        {nextStatus && (
          <button
            className="btn btn-secondary"
            onClick={() => onStatusChange(task.id, nextStatus, selectedActor)}
          >
            Pindah ke {STATUS_LABELS[nextStatus]}
          </button>
        )}

        <button className="btn btn-info" onClick={() => onViewLogs(task.id)}>
          Log Aktivitas
        </button>

        <button className="btn btn-danger" onClick={() => onDelete(task.id)}>
          Hapus
        </button>
      </div>
    </div>
  );
}
