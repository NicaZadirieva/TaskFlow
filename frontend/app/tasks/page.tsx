import { getTasksReq } from '@/api/requests';
import TasksInKanban from '@/components/ui/TasksInKanban';
import { fromTaskSchema } from '../../api/mappers/to_entities/fromTaskSchema';


export default async function ListAllTasksPage() {
  const tasks = await getTasksReq();
  if (tasks) {
    const mapped = tasks.map(fromTaskSchema);
    return (
    <div style={{ background: '#f5f6f8', minHeight: '100vh', padding: 32 }}>
      <TasksInKanban tasks={mapped} />
    </div>
  );
  }
  
}