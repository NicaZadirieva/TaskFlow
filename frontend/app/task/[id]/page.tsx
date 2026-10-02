import { notFound } from 'next/navigation';
import { fromTaskSchema } from '../../../api/mappers/to_entities/fromTaskSchema';
import getTaskReq from '../../../api/requests/task/get_task/get_task.req';
import TaskEditor from '../../../components/ui/TaskEditor';
import TaskPageParams from './TaskPageParams';

export default async function TaskPage({ params }: TaskPageParams) {
	const { id } = await params;
	const task = await getTaskReq(id);
	if (!task) {
		return notFound();
	}
	const mapped = fromTaskSchema(task);
	return <TaskEditor task={mapped}/>
}