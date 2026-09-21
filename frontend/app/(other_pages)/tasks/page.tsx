import { fromTaskSchema } from '../api/from_schema/fromTaskSchema';
import getTasksReq from './api/get_tasks/req';
import TasksInRow from './TasksInRow';


export default async function ListAllTasksPage() {
  const tasks = await getTasksReq();
  if (tasks) {
    const mapped = tasks.map(fromTaskSchema);
    return (
    <div style={{ background: '#f5f6f8', minHeight: '100vh', padding: 32 }}>
      <TasksInRow tasks={mapped} />
    </div>
  );
  }
  
}