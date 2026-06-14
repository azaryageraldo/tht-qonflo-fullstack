import { useState } from 'react';

interface TaskFormProps {
  onCreateTask: (title: string) => void;
}

export default function TaskForm({ onCreateTask }: TaskFormProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreateTask(title.trim());
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Masukkan judul tugas..."
        className="task-input"
      />
      <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
        Tambah Tugas
      </button>
    </form>
  );
}
