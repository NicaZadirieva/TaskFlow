import getBackendUrl from '@/utils/getBackendUrl';
import isMockEnabled from '@/utils/isMockEnabled';
import RequestError from '@/api/utils/error';
import parseErrorMessage from '@/utils/parseErrorMessage';

export default async function updateTaskProject(id: number, projectId: number | null) {
	if (isMockEnabled()) throw new Error('Изменение проекта недоступно в демонстрационном режиме');
	const response = await fetch(`${getBackendUrl()}/task/${id}/project`, {
		method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ project_id: projectId })
	});
	if (!response.ok) throw new RequestError(await parseErrorMessage(response, response.statusText), response.status);
}
