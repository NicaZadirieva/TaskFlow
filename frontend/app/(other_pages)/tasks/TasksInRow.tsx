import { Task } from './interfaces/task.interface';
import { TaskRow } from './task/widgets';

export default function TasksInRow({ tasks }: { tasks: Task[] }) {
  return (
	<>
	  <div
		style={{
		  display: "grid",
		  gridTemplateColumns: "1fr",
		  gap: 20,
		  maxWidth: 1200,
		  margin: "0 auto",
		}}
	  >
		{tasks.map((t) => (
		  <TaskRow key={t.id} task={t} />
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
