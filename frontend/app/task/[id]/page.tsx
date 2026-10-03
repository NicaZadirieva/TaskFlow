import { getTaskReq } from '@/api/requests';
import { TaskEditor } from '@/components/ui/task';
import { notFound } from 'next/navigation';

import { fromTaskDto } from '@/api/mappers';
import TaskPageParams from './TaskPageParams';

export default async function TaskPage({ params }: TaskPageParams) {
	const { id } = await params;
	const task = await getTaskReq(id);
	if (!task) {
		return notFound();
	}
	const mapped = fromTaskDto(task);
	return <TaskEditor task={mapped}/>
}