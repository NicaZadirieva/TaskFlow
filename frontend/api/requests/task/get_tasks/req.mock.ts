import { ExecutorShortOut } from "@/api/dto/task/get_tasks/ExecutorShortOut";
import TagShortOut from "@/api/dto/task/get_tasks/TagShortOut";
import { TaskOut } from "@/api/dto/task/get_tasks/TaskOut";
import TasksOut from "@/api/dto/task/get_tasks/TasksOut";

// ---------- фабрика executor ----------

function executor(
	overrides: Partial<ExecutorShortOut> &
		Pick<ExecutorShortOut, "id" | "user_id" | "name">,
): ExecutorShortOut {
	return {
		login: `user${overrides.user_id}`,
		email: overrides.user_id + "@yandex.ru",
		role_in_task: "Developer",
		is_active: true,
		removed: false,
		hours: null,
		planned: null,
		hourly_rate: null,
		remove_reason: null,
		reassigned_reason: null,
		...overrides,
	};
}

// ---------- справочники ----------

const TAGS: TagShortOut[] = [
	{ id: 1, tenant_id: 1, name: "feature", description: "Новая функциональность" },
	{ id: 2, tenant_id: 1, name: "frontend", description: "Клиентская часть" },
	{ id: 3, tenant_id: 1, name: "reporting", description: null },
	{ id: 4, tenant_id: 1, name: "chore", description: "Рутинная работа" },
	{ id: 5, tenant_id: 1, name: "backend", description: "Серверная часть" },
	{ id: 6, tenant_id: 1, name: "auth", description: null },
	{ id: 7, tenant_id: 1, name: "tech-debt", description: "Технический долг" },
	{ id: 8, tenant_id: 1, name: "refactoring", description: null },
	{ id: 9, tenant_id: 1, name: "research", description: "Исследование" },
	{ id: 10, tenant_id: 1, name: "performance", description: null },
	{ id: 11, tenant_id: 1, name: "infra", description: null },
];

const ALL_EXECUTORS: ExecutorShortOut[] = [
	executor({ id: 101, user_id: 1,  name: "Алексей К.",   login: "alex",       role_in_task: "Frontend" }),
	executor({ id: 102, user_id: 2,  name: "Мария С.",     login: "maria",      role_in_task: "Backend" }),
	executor({ id: 103, user_id: 3,  name: "Иван П.",      login: "ivan",       role_in_task: "Backend" }),
	executor({ id: 104, user_id: 4,  name: "Дмитрий П.",   login: "dmitry",     role_in_task: "Tech Lead" }),
	executor({ id: 105, user_id: 5,  name: "Елена С.",     login: "elena",      role_in_task: "Backend" }),
	executor({ id: 106, user_id: 6,  name: "Олег Р.",      login: "oleg",       role_in_task: "DevOps" }),
	executor({ id: 107, user_id: 7,  name: "Анна К.",      login: "anna",       role_in_task: "QA" }),
	executor({ id: 108, user_id: 8,  name: "Дмитрий В.",   login: "dmitryv",    role_in_task: "Backend" }),
	executor({ id: 109, user_id: 9,  name: "Мария П.",     login: "mariap",     role_in_task: "Frontend" }),
	executor({ id: 110, user_id: 10, name: "Сергей Н.",    login: "sergey",     role_in_task: "DevOps" }),
	executor({ id: 111, user_id: 11, name: "Ирина Л.",     login: "irina",      role_in_task: "Designer" }),
];

// ---------- задачи ----------

const TASKS: TaskOut[] = [
	{
		id: 1,
		tenant_id: 1,
		project_id: 1,
		title: "Добавить экспорт отчёта в CSV",
		description:
			'Реализовать выгрузку текущего отчёта в формате CSV по кнопке на странице отчётов. Учесть корректное экранирование значений, разделитель ";" для совместимости с Excel (RU-локаль) и кодировку UTF-8 с BOM. Название файла формировать по шаблону report_YYYY-MM-DD.csv. Экспорт должен работать для всех активных фильтров, применённых к отчёту.',
		status: "DONE",
		priority: "low",
		due_date: "2026-09-10T00:00:00Z",
		created_at: "2026-08-10T00:00:00Z",
		created_by: 1,
		overdue_days: 0,
		estimated_hours: "8.00",
		actual_hours: "6.00",
		estimated_budget: "16000.00",
		actual_budget: "12000.00",
		note: null,
		task_images: null,
		tags: TAGS.filter((t) => [1, 2, 3].includes(t.id)),
		executors: [
			executor({
				id: 1,
				user_id: 1,
				name: "Алексей К.",
				login: "alex",
				role_in_task: "Frontend",
				hours: 6,
				planned: 8,
				hourly_rate: 1500,
			}),
		],
	},
	{
		id: 2,
		tenant_id: 1,
		project_id: 1,
		title: "Рефакторинг модуля авторизации",
		description:
			"Привести модуль авторизации к единому стилю: выделить сервисный слой, убрать дублирование проверок прав, перейти на единый тип AuthContext. Разделить обработку JWT и refresh-токенов, добавить недостающие тесты на граничные случаи (просроченный токен, отсутствующий заголовок, невалидная подпись). В рамках задачи также планируется устранить накопленный техдолг по этому модулю, выявленный на последнем ревью.",
		status: "IN_PROGRESS",
		priority: "medium",
		due_date: "2026-09-08T00:00:00Z",
		created_at: "2026-08-01T00:00:00Z",
		created_by: 1,
		overdue_days: 8,
		estimated_hours: "16.00",
		actual_hours: "26.00",
		estimated_budget: "48000.00",
		actual_budget: "78000.00",
		note: {
			kind: "danger",
			label: "Причина",
			text: "недооценил объём — задача > 8 ч, надо было дробить",
		},
		task_images: null,
		tags: TAGS.filter((t) => [4, 5, 6, 7, 8].includes(t.id)),
		executors: [
			executor({
				id: 2,
				user_id: 2,
				name: "Мария С.",
				login: "maria",
				role_in_task: "Backend",
				hours: 18,
				planned: 10,
				hourly_rate: 2000,
			}),
			executor({
				id: 3,
				user_id: 3,
				name: "Иван П.",
				login: "ivan",
				role_in_task: "Backend",
				hours: 8,
				planned: 6,
				hourly_rate: 1800,
			}),
		],
	},
	{
		id: 3,
		tenant_id: 1,
		project_id: 1,
		title: "Исследовать варианты кэширования",
		description:
			"Провести сравнительный анализ вариантов кэширования для высоконагруженных эндпоинтов: in-memory (LRU), Redis и CDN-кэш на уровне edge. Оценить latency, стоимость инфраструктуры, сложность инвалидации и влияние на консистентность данных. По итогам исследования подготовить краткий документ с рекомендацией и черновой схемой внедрения. Формат — timebox на 8 часов, оценка намеренно нестабильна.",
		status: "OPEN",
		priority: "high",
		due_date: "2026-09-20T00:00:00Z",
		created_at: "2026-08-05T00:00:00Z",
		created_by: 1,
		overdue_days: 0,
		estimated_hours: "8.00",
		actual_hours: "4.00",
		estimated_budget: "40000.00",
		actual_budget: "20000.00",
		note: {
			kind: "info",
			label: "Timebox",
			text: "исследование — оценка нестабильна, ограничено 8 ч",
		},
		task_images: null,
		tags: TAGS.filter((t) => [9, 10, 11].includes(t.id)),
		executors: [
			executor({
				id: 4,
				user_id: 4,
				name: "Дмитрий П.",
				login: "dmitry",
				role_in_task: "Tech Lead",
				hours: 2,
				planned: 4,
				hourly_rate: 3000,
			}),
			executor({
				id: 5,
				user_id: 5,
				name: "Елена С.",
				login: "elena",
				role_in_task: "Backend",
				hours: 1.5,
				planned: 3,
				hourly_rate: 1900,
			}),
			executor({
				id: 6,
				user_id: 6,
				name: "Олег Р.",
				login: "oleg",
				role_in_task: "DevOps",
				hours: 0.5,
				planned: 1,
				hourly_rate: 2200,
			}),
		],
	},
];

// ---------- экспорт ----------

export default async function getTasksReqMock(
	_search?: URLSearchParams,
): Promise<TasksOut> {
	return {
		items: TASKS,
		total: TASKS.length,
		limit: 100,
		offset: 0,
		all_tags: TAGS,
		all_executors: ALL_EXECUTORS,
	};
}