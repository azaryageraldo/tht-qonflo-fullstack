import { Router } from 'express';
import {
  listTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  getAuditLogs,
} from '../controllers/tasks.js';

const router = Router();

router.get('/tasks', listTasks);
router.post('/tasks', createTask);
router.put('/tasks/:id/status', updateTaskStatus);
router.delete('/tasks/:id', deleteTask);
router.get('/tasks/:id/audit-logs', getAuditLogs);

export default router;
