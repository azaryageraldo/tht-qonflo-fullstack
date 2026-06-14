import fs from 'node:fs';
import path from 'node:path';
import type { Task, AuditLog } from './types.js';

const DATA_PATH = path.resolve(__dirname, '..', 'data', 'store.json');

interface Store {
  tasks: Task[];
  auditLogs: AuditLog[];
}

function readStore(): Store {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw) as Store;
}

function writeStore(data: Store): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function getTasks(): Task[] {
  return readStore().tasks;
}

export function getTaskById(id: string): Task | undefined {
  return readStore().tasks.find((t) => t.id === id);
}

export function addTask(task: Task): void {
  const store = readStore();
  store.tasks.push(task);
  writeStore(store);
}

export function updateTaskStatus(id: string, newStatus: Task['status']): void {
  const store = readStore();
  const task = store.tasks.find((t) => t.id === id);
  if (task) {
    task.status = newStatus;
    writeStore(store);
  }
}

export function deleteTask(id: string): void {
  const store = readStore();
  const task = store.tasks.find((t) => t.id === id);
  if (task) {
    task.isDeleted = true;
    writeStore(store);
  }
}

export function getAuditLogsByTaskId(taskId: string): AuditLog[] {
  return readStore().auditLogs.filter((log) => log.taskId === taskId);
}

export function addAuditLog(log: AuditLog): void {
  const store = readStore();
  store.auditLogs.push(log);
  writeStore(store);
}
