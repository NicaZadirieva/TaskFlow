import { Task } from '@/app/api/models/task.interface';
import { TaskInKanban } from '@/app/components/tasks/widgets';

export default function TasksInKanban({ tasks }: { tasks: Task[] }) {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: 20,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {tasks.map((t) => (
          <TaskInKanban key={t.id} task={t} />
        ))}
      </div>

      <style>{`
        .assignee-actions { opacity: 0; transition: opacity .15s ease; }
        .assignee-row:hover { background: #f9fafb; }
        .assignee-row:hover .assignee-actions { opacity: 1; }
      `}</style>
    </>
  );
}
