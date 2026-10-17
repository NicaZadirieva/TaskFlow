import type CreateExecutorRequest from "@/api/dto/executor/create/CreateExecutorRequest";
import type CreateExecutorResponse from "@/api/dto/executor/create/CreateExecutorResponse";
import getBackendUrl from "@/utils/getBackendUrl";

// TODO: привести к этому интерфейсу все ответы
export type CreateExecutorResult =
    | { success: true; data: CreateExecutorResponse }
    | { success: false; error: string; code?: 'DUPLICATE' | 'FORBIDDEN' | 'VALIDATION' | 'NETWORK' };

export default async function createExecutorReqReal(
    dto: CreateExecutorRequest,
): Promise<CreateExecutorResult> {
    try {
        const res = await fetch(`${getBackendUrl()}/executor/create`, {
            method: 'POST',
            credentials: 'include',    
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto),
            cache: 'no-store',
        });

        if (res.status === 201) {
            return { success: true, data: await res.json() as CreateExecutorResponse };
        }
        if (res.status === 409) {
            return { success: false, code: 'DUPLICATE', error: 'Уже назначен' };
        }
        if (res.status === 403) {
            return { success: false, code: 'FORBIDDEN', error: 'Нет прав' };
        }
        return { success: false, error: `Ошибка ${res.status}` };
    } catch {
        return { success: false, code: 'NETWORK', error: 'Ошибка сети' };
    }
}