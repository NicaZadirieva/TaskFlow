import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { Executor } from '@/entities/executor.interface';
import CreateExecutorResponse from '@/api/dto/executor/create/CreateExecutorResponse';
import createExecutorReq from '@/api/requests/executor/create/client/create.req';
import { Task } from '@/entities/task.interface';

type AddAssigneeArgs = Pick<
	Executor,
  'login' | 'role_in_task' | 'hours' | 'planned' | 'hourly_rate'
>;

interface UseAddAssigneeOptions {
	taskId: number;
	version?: number;
	queryKey?: readonly unknown[]; // по умолчанию ['tasks']
	onSuccess?: (res: CreateExecutorResponse) => void;
	onError?: (error: unknown) => void;
}

export function useAddAssignee({
	taskId,
	version: fallbackVersion,
	queryKey = ['tasks'],
	onSuccess,
	onError
}: UseAddAssigneeOptions) {
	const queryClient = useQueryClient();

	return useMutation<CreateExecutorResponse, unknown, AddAssigneeArgs>({
		mutationFn: (assignee) => {
			// берём актуальную версию из кеша, а не из замыкания компонента
			const tasks = queryClient.getQueryData<Task[]>(queryKey);
			const version =
				tasks?.find((t) => t.id === taskId)?.version ?? fallbackVersion;

			return createExecutorReq({
				task_id: taskId,
				login: assignee.login,
				role_in_task: assignee.role_in_task,
				hours: assignee.hours,
				planned: assignee.planned,
				hourly_rate: assignee.hourly_rate,
				version
			});
		},

		onSuccess: async (res) => {
			// Reload totals and assignments together, including restored assignments.
			await queryClient.invalidateQueries({ queryKey });
			message.success('Исполнитель добавлен');
			onSuccess?.(res);
		},

		onError: (error) => {
			// 409 конфликт или сетевая ошибка → тянем свежие данные
			queryClient.invalidateQueries({ queryKey });
			message.error('Не удалось добавить исполнителя — обновите задачу');
			onError?.(error);
		}
	});
}
