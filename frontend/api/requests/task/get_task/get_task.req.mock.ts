
import { TaskOut } from '@/api/dto/task/get_tasks/TaskOut';
import { Priority, TaskStatus } from '@/api/types/task.types';

const TEST_TASK: TaskOut = {
	id: 3,
	project_id: 1,
	tenant_id: 1,
	title: 'Исследовать варианты кэширования',
	description:
	  'Провести сравнительный анализ вариантов кэширования для высоконагруженных эндпоинтов: in-memory (LRU), Redis и CDN-кэш на уровне edge. Оценить latency, стоимость инфраструктуры, сложность инвалидации и влияние на консистентность данных. По итогам исследования подготовить краткий документ с рекомендацией и черновой схемой внедрения. Формат — timebox на 8 часов, оценка намеренно нестабильна.',
	status: 'OPEN' as TaskStatus,
	actual_hours: '4',
	estimated_hours: '8',
	actual_budget: '20000',
	estimated_budget: '40000',
	due_date: '2026-09-20',
	created_by: 1,
	created_at: '2026-08-05',
	overdue_days: 0,
	note: {
		kind: 'info',
		label: 'Timebox',
		text: 'исследование — оценка нестабильна, ограничено 8 ч'
	},
	executors: [
		{
			id: 4,
			user_id: 4,
			name: 'Дмитрий П.',
			role_in_task: 'Tech Lead',
			is_active: true,
			hourly_rate: 4500,
			login: 'login',
			email: 'email',
			removed: false
		},
		{
			id: 5,
			user_id: 5,
			name: 'Елена С.',
			role_in_task: 'Backend',
			is_active: true,
			hourly_rate: 2500,
			login: 'login',
			email: 'email',
			removed: false
		},
		{
			id: 6,
			user_id: 6,
			name: 'Олег Р.',
			role_in_task: 'DevOps',
			is_active: true,
			hourly_rate: 1500,
			login: 'login',
			email: 'email',
			removed: false
		}
	],
	tags: [
		{ id: 9, name: 'research', description: 'Исследование', tenant_id: 1 },
		{ id: 10, name: 'performance', tenant_id: 1  },
		{ id: 11, name: 'infra', tenant_id: 1  }
	],
	priority: 'high' as Priority
};

export default async function getTaskReqMock(taskId: number) {
	return TEST_TASK;
}