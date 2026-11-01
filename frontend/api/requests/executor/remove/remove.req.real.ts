import RemoveUserFromTaskRequest from '@/api/dto/executor/remove/RemoveUserFromTaskRequest';
import RemoveUserFromTaskResponse from '@/api/dto/executor/remove/RemoveUserFromTaskResponse';
import getBackendUrl from '@/utils/getBackendUrl';
// TODO: сделать в виде дженерика на все запросы
export type DeleteExecutorResult =
	| { success: true; data: RemoveUserFromTaskResponse }
	| { success: false; error: string; code?: 'DUPLICATE' | 'FORBIDDEN' | 'VALIDATION' | 'NETWORK' };

export default async function removeExecutorFromTaskClientReqReal(
	dto: RemoveUserFromTaskRequest
) : Promise<DeleteExecutorResult> {
	try {
		const res = await fetch(`${getBackendUrl()}/executor/remove`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(dto),
			cache: 'no-store'
		});
		if (res.status === 200) {
			return {
				success: true,
				data: (await res.json()) as RemoveUserFromTaskResponse
			};
		}
		if (res.status === 403) {
			return { success: false, code: 'FORBIDDEN', error: 'Нет прав' };
		}
		return { success: false, error: `Ошибка ${res.status}` };
	} catch {
		return { success: false, code: 'NETWORK', error: 'Ошибка сети' };
	}
}
