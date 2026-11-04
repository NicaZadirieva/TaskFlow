import { getTaskReq } from '@/api/requests';
import { TaskEditor } from '@/components/ui/task';
import { notFound } from 'next/navigation';


import TaskPageParams from './TaskPageParams';
import { fromTaskOut } from '@/api/dto/task/get_tasks/mapper/fromTaskOut';

export default async function TaskPage({ params }: TaskPageParams) {
	const { id } = await params;
	const task = await getTaskReq(id);
	if (!task) {
		return notFound();
	}
	const mapped = fromTaskOut(task);
	return <TaskEditor task={mapped}/>;
}