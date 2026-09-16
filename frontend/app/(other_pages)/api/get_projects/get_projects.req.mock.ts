import { IProject } from '@/app/shared/interface/project.interface';
import { Project } from '@/app/shared/schema/project.types';

const mockProjects: Project[] = [
  {
    id: 1,
    tenant_id: 5,
    name: "Редизайн личного кабинета",
    description: "Обновление UI/UX личного кабинета клиента",
    budget_hours: 120,
    deadline: new Date("2026-10-15"),
  },
  {
    id: 2,
    tenant_id: 5,
    name: "Интеграция с платежным шлюзом",
    description: "Подключение ЮKassa и обработка вебхуков",
    budget_hours: 80,
    deadline: new Date("2026-11-01"),
  },
  {
    id: 3,
    tenant_id: 5,
    name: "Внутренний аудит безопасности",
    // без описания и дедлайна — проверка опциональных полей
    budget_hours: 40,
  },
];

export default async function getProjectsReqMock(): Promise<IProject[]> {
	return mockProjects;
}