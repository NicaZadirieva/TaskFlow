import { fromTaskDto } from '@/api/mappers';
import { getTasksReq } from '@/api/requests';
import StatusTaskFilter from '@/components/ui/task/entities/StatusTaskFilter';
import TasksInKanban from '@/components/ui/task/widgets/TasksInKanban';


export default async function ListAllTasksPage() {
  const tasks = await getTasksReq();
  if (tasks) {
    const mapped = tasks.map(fromTaskDto);
    return (
    <div style={{ background: '#f5f6f8', minHeight: '100vh', padding: 32 }}>
        <StatusTaskFilter />
      <TasksInKanban tasks={mapped} />
    </div>
  );
  }
  
}