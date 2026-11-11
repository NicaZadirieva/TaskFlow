
import { getTaskReq } from '@/api/requests';
import { TaskEditor } from '@/components/ui/task';
import { notFound } from 'next/navigation';
import RequestError from '@/api/utils/error';


import TaskPageParams from './TaskPageParams';
import { fromTaskOut } from '@/api/dto/task/get_tasks/mapper/fromTaskOut';
import getCurrentUserServerReq from '@/api/requests/user/get_current_user/server/get_current_user.req';
import getProjectsServerReq from '@/api/requests/project/get_projects/server/req';
import { TenantRole } from '@/api/types/user.types';
import TaskProjectEditor from '@/components/ui/task/features/TaskProjectEditor';

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
	const user = await getCurrentUserServerReq();
	const projects = user.role === TenantRole.OWNER ? await getProjectsServerReq() : [];
	return <>{user.role === TenantRole.OWNER && <TaskProjectEditor taskId={mapped.id} projectId={mapped.project_id} options={projects.map(({ id, name }) => ({ value: id, label: name }))} />}<TaskEditor key={`${mapped.id}-${mapped.version}`} task={mapped} canEdit={user.role === TenantRole.OWNER}/></>;
}
