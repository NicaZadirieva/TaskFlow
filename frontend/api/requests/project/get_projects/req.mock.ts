import RequestError from '@/api/utils/error';
import type { ProjectSummary } from './types';

const projects: ProjectSummary[] = [
	{ id: 1, name: 'Разработка приложения', budget: 180000, budget_hours: 120, deadline: null, progress: 50, tasks: [
		{ id: 1, title: 'Добавить экспорт отчёта в CSV', status: 'DONE' },
		{ id: 2, title: 'Рефакторинг модуля авторизации', status: 'IN_PROGRESS' }
	] }
];

export default async function getProjectsMock(id?: string): Promise<ProjectSummary[]> {
	if (!id) return projects;
	const project = projects.find((item) => String(item.id) === id);
	if (!project) throw new RequestError('Project not found', 404);
	return [project];
}
