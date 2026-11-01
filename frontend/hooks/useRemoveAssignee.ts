
import RemoveUserFromTaskResponse from '@/api/dto/executor/remove/RemoveUserFromTaskResponse';
import removeExecutorFromTaskReq from '@/api/requests/executor/remove/client/remove.req';
import { Executor } from '@/entities/executor.interface';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';


type RemoveAssigneeArgs = Pick<Executor, 'user_id' | 'remove_reason'>;

interface UseRemoveAssigneeOptions {
	taskId: number;
	queryKey?: readonly unknown[]; // по умолчанию ['tasks']
	onSuccess?: () => void;
	onError?: (error: unknown) => void;
}

export function useRemoveAssignee({
	taskId,
	queryKey = ['tasks'],
	onSuccess,
	onError
}: UseRemoveAssigneeOptions) {
	const queryClient = useQueryClient();

	return useMutation<RemoveUserFromTaskResponse, unknown, RemoveAssigneeArgs>({
		mutationFn: (assignee) =>
			removeExecutorFromTaskReq({
				task_id: taskId,
				user_id: assignee.user_id,
				remove_reason: assignee.remove_reason
			}),

		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey });
			message.success('Исполнитель удален');
			onSuccess?.();
		},

		onError: (error) => {
			// 409 конфликт или сетевая ошибка → тянем свежие данные
			queryClient.invalidateQueries({ queryKey });
			message.error('Не удалось удалить исполнителя — обновите задачу');
			onError?.(error);
		}
	});
}