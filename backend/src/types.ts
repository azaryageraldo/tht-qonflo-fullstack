export type TaskStatus = 'to_do' | 'pending' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  taskId: string;
  actor: string;
  previousStatus: TaskStatus;
  newStatus: TaskStatus;
  changedAt: string;
}

// Alur status yang diperbolehkan: to_do → pending → in_progress → done
export const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus | null> = {
  to_do: 'pending',
  pending: 'in_progress',
  in_progress: 'done',
  done: null,
};
