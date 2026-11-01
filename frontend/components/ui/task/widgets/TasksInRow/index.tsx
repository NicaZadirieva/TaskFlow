'use client';

import { Task } from '@/entities/task.interface';
import TaskRow from '../../entities/TaskRow';
import { User } from '@/entities/user.interface';
import { useQuery } from '@tanstack/react-query';
import getTasksClientReq from '@/api/requests/task/get_tasks/client/req';
import { fromTaskOut } from '@/api/dto/task/get_tasks/mapper/fromTaskOut';
import getClientUsersReq from '@/api/requests/user/get_users/client/get_users.req';




export default function TasksInRow({ initialTasks,
	initialUsers,
	search }: {
	  initialTasks: Task[];
	  initialUsers: User[];
	  search: string;
	}) {
		const { data: tasks = [] } = useQuery({
				queryKey: ['tasks', search],
				queryFn: () =>
					getTasksClientReq(search ? new URLSearchParams(search) : undefined).then(
						(d) => d.items.map(fromTaskOut)
					),
				initialData: initialTasks,
				refetchInterval: 5_000,
				refetchIntervalInBackground: false
			});
		const { data: users = [] } = useQuery({
				queryKey: ['users'],
				queryFn: () => getClientUsersReq().then((d) => d.users),
				initialData: initialUsers,
				staleTime: 5 * 60_000,
				refetchOnWindowFocus: false
			});
	return (
		<>
	  <div
				style={{
		  display: 'grid',
		  gridTemplateColumns: '1fr',
		  gap: 20,
		  maxWidth: 1200,
		  margin: '0 auto'
				}}
	  >
				{tasks.map((t) => (
		  <TaskRow key={t.id} task={t} users={users}/>
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
