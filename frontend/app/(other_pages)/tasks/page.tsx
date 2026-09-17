import TaskCard from './component/task';
import { Task } from './interface/task.interface';

const TASKS: Task[] = [
  {
    id: 'GH-142',
    project_id: 1,
    title: 'Добавить экспорт отчёта в CSV',
    status: 'DONE',
    hours: { fact: 6, planned: 8 },
    budget: { fact: 12000, planned: 16000 },
    estimate: { planned: 8, fact: 6 },
    ratio: 0.75,
    due_date: '2026-09-10',
    overdueDays: 0,
    assignees: [
      {
        id: '1',
        name: 'Алексей К.',
        role: 'Frontend',
        hours: 6,
        planned: 8,
      },
    ],
    tags: [
      { id: 1, name: 'feature', color: '0e8a16', description: 'Новая функциональность' },
      { id: 2, name: 'frontend', color: '1d76db', description: 'Клиентская часть' },
      { id: 3, name: 'reporting', color: '5319e7' },
    ],
    priority: 'LOW',
  },
  {
    id: 'GH-158',
    title: 'Рефакторинг модуля авторизации',
    status: 'IN_PROGRESS',
    hours: { fact: 26, planned: 16 },
    budget: { fact: 78000, planned: 48000 },
    estimate: { planned: 16, fact: 26 },
    ratio: 1.63,
    due_date: '2026-09-08',
    overdueDays: 8,
    note: {
      kind: 'danger',
      label: 'Причина',
      text: 'недооценил объём — задача > 8 ч, надо было дробить',
    },
    assignees: [
      {
        id: '2',
        name: 'Мария С.',
        role: 'Backend',
        hours: 18,
        planned: 10,
      },
      {
        id: '3',
        name: 'Иван П.',
        role: 'Backend',
        hours: 8,
        planned: 6,
      },
    ],
    tags: [
      { id: 4, name: 'chore', color: 'fbca04', description: 'Рутинная работа' },
      { id: 5, name: 'backend', color: 'd73a4a', description: 'Серверная часть' },
      { id: 6, name: 'auth', color: 'b60205' },
      { id: 7, name: 'tech-debt', color: '6f42c1', description: 'Технический долг' },
      { id: 8, name: 'refactoring', color: 'c5def5' },
    ],
    priority: 'MEDIUM',
  },
  {
    id: 'GH-171',
    title: 'Исследовать варианты кэширования',
    status: 'OPEN',
    hours: { fact: 4, planned: 8, unit: 'timebox' },
    budget: { fact: 20000, planned: 40000 },
    estimate: { planned: 8, fact: 4 },
    ratio: null,
    due_date: '2026-09-20',
    overdueDays: 0,
    note: {
      kind: 'info',
      label: 'Timebox',
      text: 'исследование — оценка нестабильна, ограничено 8 ч',
    },
    assignees: [
      {
        id: '4',
        name: 'Дмитрий П.',
        role: 'Tech Lead',
        hours: 2,
        planned: 4,
      },
      {
        id: '5',
        name: 'Елена С.',
        role: 'Backend',
        hours: 1.5,
        planned: 3,
      },
      {
        id: '6',
        name: 'Олег Р.',
        role: 'DevOps',
        hours: 0.5,
        planned: 1,
      },
    ],
    tags: [
      { id: 9, name: 'research', color: '0075ca', description: 'Исследование' },
      { id: 10, name: 'performance', color: 'e99695' },
      { id: 11, name: 'infra', color: '006b75' },
    ],
    priority: 'HIGH',
  },
];

export default function TasksPage() {
  return (
    <div style={{ background: '#f5f6f8', minHeight: '100vh', padding: 32 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 20,
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        {TASKS.map((t) => (
          <TaskCard key={t.id} task={t} />
        ))}
      </div>

      <style>{`
        .assignee-actions { opacity: 0; transition: opacity .15s ease; }
        .assignee-row:hover { background: #f9fafb; }
        .assignee-row:hover .assignee-actions { opacity: 1; }
      `}</style>
    </div>
  );
}