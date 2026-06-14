import { useState, useEffect } from 'react';
import type { Task, TaskStatus } from './types';
import { USERS } from './types';
import { fetchTasks, createTask, updateTaskStatus, deleteTask } from './api';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';
import AuditLogModal from './components/AuditLogModal';
import './App.css';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedActor, setSelectedActor] = useState<string>(USERS[0]);
  const [auditTaskId, setAuditTaskId] = useState<string | null>(null);

  const loadTasks = async () => {
    try {
      setError('');
      const data = await fetchTasks();
      setTasks(data);
    } catch {
      setError('Gagal memuat tugas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (title: string) => {
    try {
      setError('');
      await createTask(title);
      await loadTasks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal membuat tugas');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus, actor: string) => {
    try {
      setError('');
      await updateTaskStatus(taskId, newStatus, actor);
      await loadTasks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah status');
    }
  };

  const handleDelete = async (taskId: string, actor: string) => {
    try {
      setError('');
      await deleteTask(taskId, actor);
      await loadTasks();
    } catch {
      setError('Gagal menghapus tugas');
    }
  };

  const auditTask = tasks.find((t) => t.id === auditTaskId);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mini Task Manager</h1>
        <div className="actor-selector">
          <label htmlFor="actor">Bertindak sebagai:</label>
          <select
            id="actor"
            value={selectedActor}
            onChange={(e) => setSelectedActor(e.target.value)}
          >
            {USERS.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError('')}>&times;</button>
        </div>
      )}

      <TaskForm onCreateTask={handleCreateTask} />

      {loading ? (
        <p className="loading">Memuat tugas...</p>
      ) : tasks.length === 0 ? (
        <p className="empty-state">Belum ada tugas. Buat tugas pertamamu di atas!</p>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              selectedActor={selectedActor}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onViewLogs={(id) => setAuditTaskId(id)}
            />
          ))}
        </div>
      )}

      {auditTaskId && auditTask && (
        <AuditLogModal
          taskId={auditTaskId}
          taskTitle={auditTask.title}
          onClose={() => setAuditTaskId(null)}
        />
      )}
    </div>
  );
}

export default App;
