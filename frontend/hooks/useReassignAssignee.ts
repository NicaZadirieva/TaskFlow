
import ReassignedUserTaskResponse from '@/api/dto/executor/reassign/ReassignedUserTaskResponse';
import reassignExecutorToTaskReq from '@/api/requests/executor/reassign/client/reassign.req';
import { Executor } from '@/entities/executor.interface';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';


type ReassignAssigneeArgs = Pick<Executor, 'user_id' | 'reassigned_reason'>;

interface UseReassignAssigneeOptions {
	taskId: number;
	queryKey?: readonly unknown[]; // по умолчанию ['tasks']
	onSuccess?: () => void;
	onError?: (error: unknown) => void;
}

export function useReassignAssignee({
	taskId,
	queryKey = ['tasks'],
	onSuccess,
	onError
}: UseReassignAssigneeOptions) {
	const queryClient = useQueryClient();

	return useMutation<ReassignedUserTaskResponse, unknown, ReassignAssigneeArgs>({
		mutationFn: (assignee) =>
			reassignExecutorToTaskReq({
				task_id: taskId,
				user_id: assignee.user_id,
				reassigned_reason: assignee.reassigned_reason
			}),

		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey });
			message.success('Исполнитель вовзращен на задачку');
			onSuccess?.();
		},

		onError: (error) => {
			// 409 конфликт или сетевая ошибка → тянем свежие данные
			queryClient.invalidateQueries({ queryKey });
			message.error('Не удалось возвратить исполнителя — обновите задачу');
			onError?.(error);
		}
	});
}