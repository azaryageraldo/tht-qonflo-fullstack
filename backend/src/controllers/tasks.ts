import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { TaskStatus } from '../types.js';
import { VALID_TRANSITIONS } from '../types.js';
import * as store from '../store.js';

// GET /tasks
export function listTasks(_req: Request, res: Response): void {
  const tasks = store.getTasks();
  res.json(tasks);
}

// POST /tasks
export function createTask(req: Request, res: Response): void {
  const { title } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    res.status(400).json({ error: 'Judul tugas wajib diisi' });
    return;
  }

  const task = {
    id: uuidv4(),
    title: title.trim(),
    status: 'to_do' as TaskStatus,
    createdAt: new Date().toISOString(),
    isDeleted: false,
  };

  store.addTask(task);
  res.status(201).json(task);
}

// PUT /tasks/:id/status
export function updateTaskStatus(req: Request, res: Response): void {
  const id = req.params.id as string;
  const { status, actor } = req.body;

  if (!actor || typeof actor !== 'string' || actor.trim().length === 0) {
    res.status(400).json({ error: 'Actor wajib diisi' });
    return;
  }

  const task = store.getTaskById(id);
  if (!task) {
    res.status(404).json({ error: 'Tugas tidak ditemukan' });
    return;
  }

  if (task.isDeleted) {
    res.status(400).json({ error: 'Tugas yang sudah dihapus tidak dapat diubah' });
    return;
  }

  if (!status || typeof status !== 'string') {
    res.status(400).json({ error: 'Status wajib diisi' });
    return;
  }

  // Idempotent: jika status sama, tidak ada perubahan
  if (task.status === status) {
    res.json(task);
    return;
  }

  // Validasi transisi status
  const allowedNext = VALID_TRANSITIONS[task.status];
  if (allowedNext !== status) {
    res.status(400).json({
      error: `Transisi status dari "${task.status}" ke "${status}" tidak valid. Status selanjutnya: "${allowedNext ?? 'tidak ada'}"`,
    });
    return;
  }

  const previousStatus = task.status;
  store.updateTaskStatus(id, status as TaskStatus);

  // Buat audit log
  store.addAuditLog({
    id: uuidv4(),
    taskId: id,
    actor: actor.trim(),
    previousStatus,
    newStatus: status as TaskStatus,
    changedAt: new Date().toISOString(),
  });

  const updatedTask = store.getTaskById(id);
  res.json(updatedTask);
}

// DELETE /tasks/:id
export function deleteTask(req: Request, res: Response): void {
  const id = req.params.id as string;

  const task = store.getTaskById(id);
  if (!task) {
    res.status(404).json({ error: 'Tugas tidak ditemukan' });
    return;
  }

  if (task.isDeleted) {
    res.status(400).json({ error: 'Tugas sudah dihapus sebelumnya' });
    return;
  }

  store.deleteTask(id);
  res.status(204).send();
}

// GET /tasks/:id/audit-logs
export function getAuditLogs(req: Request, res: Response): void {
  const id = req.params.id as string;

  const task = store.getTaskById(id);
  if (!task) {
    res.status(404).json({ error: 'Tugas tidak ditemukan' });
    return;
  }

  const logs = store.getAuditLogsByTaskId(id);
  // Urutkan kronologis (terlama ke terbaru)
  logs.sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());
  res.json(logs);
}
