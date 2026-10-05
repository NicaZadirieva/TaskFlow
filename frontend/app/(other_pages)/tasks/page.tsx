import { fromTaskDto } from '@/api/mappers';
import { getTasksReq } from '@/api/requests';
import { PriorityTaskFilter, StatusTaskFilter, TasksInKanban } from '@/components/ui/task';
import styles from "./page.module.css";

export default async function ListAllTasksPage() {
  const tasks = await getTasksReq();
  if (tasks) {
    const mapped = tasks.map(fromTaskDto);
    return (
    <div style={{ background: '#f5f6f8', minHeight: '100vh', padding: 32 }}>
      <div className={styles.filters}>
          <StatusTaskFilter />
          <PriorityTaskFilter />
      </div>
        
      <TasksInKanban tasks={mapped} />
    </div>
  );
  }
  
}