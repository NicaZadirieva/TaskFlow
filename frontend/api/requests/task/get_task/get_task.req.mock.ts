
import { Priority, TaskStatus } from '@/api/types/task.types';

const TEST_TASK = {
	id: 3,
	projectId: 1,
	tenantId: 1,
	title: 'Исследовать варианты кэширования',
	description:
	  'Провести сравнительный анализ вариантов кэширования для высоконагруженных эндпоинтов: in-memory (LRU), Redis и CDN-кэш на уровне edge. Оценить latency, стоимость инфраструктуры, сложность инвалидации и влияние на консистентность данных. По итогам исследования подготовить краткий документ с рекомендацией и черновой схемой внедрения. Формат — timebox на 8 часов, оценка намеренно нестабильна.',
	status: 'OPEN' as TaskStatus,
	actualHours: 4,
	estimatedHours: 8,
	actualBudget: 20000,
	estimatedBudget: 40000,
	dueDate: new Date('2026-09-20'),
	createdBy: 1,
	createdAt: new Date('2026-08-05'),
	overdueDays: 0,
	note: {
	  kind: 'info',
	  label: 'Timebox',
	  text: 'исследование — оценка нестабильна, ограничено 8 ч',
	},
	assignees: [
	  {
		id: 4,
		taskId: 3,
		userId: 4,
		userName: 'Дмитрий П.',
		roleInTask: 'Tech Lead',
		actualHours: 2,
		estimatedHours: 4,
		tenantId: 1,
		assignedAt: new Date('2026-08-05'),
		isActive: true,
		hourly_rate: 4500
	  },
	  {
		id: 5,
		taskId: 3,
		userId: 5,
		userName: 'Елена С.',
		roleInTask: 'Backend',
		actualHours: 1.5,
		estimatedHours: 3,
		tenantId: 1,
		assignedAt: new Date('2026-08-05'),
		isActive: true,
		hourly_rate: 2500
	  },
	  {
		id: 6,
		taskId: 3,
		userId: 6,
		userName: 'Олег Р.',
		roleInTask: 'DevOps',
		actualHours: 0.5,
		estimatedHours: 1,
		tenantId: 1,
		assignedAt: new Date('2026-08-05'),
		isActive: true,
		hourly_rate: 1500
	  },
	],
	tags: [
	  { id: 9, name: 'research', description: 'Исследование', tenantId: 1 },
	  { id: 10, name: 'performance', tenantId: 1  },
	  { id: 11, name: 'infra', tenantId: 1  },
	],
	priority: 'HIGH' as Priority,
  };

export default async function getTaskReqMock(taskId: number) {
	return TEST_TASK;
}