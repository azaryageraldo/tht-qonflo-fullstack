export type TaskStatus = 'to_do' | 'pending' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
  isDeleted: boolean;
}

export interface AuditLog {
  id: string;
  taskId: string;
  actor: string;
  previousStatus: TaskStatus;
  newStatus: TaskStatus;
  changedAt: string;
}

export const USERS = ['john.doe', 'jane.smith', 'admin'] as const;

export const STATUS_LABELS: Record<TaskStatus, string> = {
  to_do: 'To Do',
  pending: 'Pending',
  in_progress: 'In Progress',
  done: 'Done',
};

export const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus | null> = {
  to_do: 'pending',
  pending: 'in_progress',
  in_progress: 'done',
  done: null,
};
