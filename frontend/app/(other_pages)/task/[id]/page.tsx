
import { getTaskReq } from '@/api/requests';
import { TaskEditor } from '@/components/ui/task';
import { notFound } from 'next/navigation';
import RequestError from '@/api/utils/error';


import TaskPageParams from './TaskPageParams';
import { fromTaskOut } from '@/api/dto/task/get_tasks/mapper/fromTaskOut';

export default async function TaskPage({ params }: TaskPageParams) {
	const { id } = await params;
	const taskId = Number(id);
	if (!Number.isSafeInteger(taskId) || taskId <= 0) {
		notFound();
	}
	const task = await getTaskReq(taskId).catch((error: unknown) => {
		if (error instanceof RequestError) {
			if (error.statusCode === 404) notFound();
			if (error.statusCode === 403) return null;
		}
		throw error;
	});
	if (!task) {
		return <p role="alert">Задача не найдена.</p>;
	}
	const mapped = fromTaskOut(task);
	return <TaskEditor task={mapped}/>;
}