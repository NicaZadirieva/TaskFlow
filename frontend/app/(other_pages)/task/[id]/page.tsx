import { fromTaskSchema } from '../../api/from_schema/fromTaskSchema';
import TaskPageParams from './TaskPageParams';
import TaskEditor from '../widgets/TaskEditor';
import getTaskReq from './api/get_task.req';
import { notFound } from 'next/navigation';

export default async function TaskPage({ params }: TaskPageParams) {
	const { id } = await params;
	const task = await getTaskReq(id);
	if (!task) {
		return notFound();
	}
	const mapped = fromTaskSchema(task);
	return <TaskEditor task={mapped}/>
}