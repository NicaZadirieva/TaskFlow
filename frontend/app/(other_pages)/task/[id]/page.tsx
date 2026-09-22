import { fromTaskSchema } from '../../../api/mappers/from_schema/fromTaskSchema';
import TaskPageParams from './TaskPageParams';
import TaskEditor from '../../../components/task/edit/widgets/TaskEditor';
import getTaskReq from '../../../api/requests/task/get_task/get_task.req';
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