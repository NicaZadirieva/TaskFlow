import TaskCard from './component';
import { Task } from './interface/task.interface';

const TASKS: Task[] = [
  {
    id: 1,
    project_id: 1,
    title: 'Добавить экспорт отчёта в CSV',
    status: 'DONE',
    hours: { fact: 6, planned: 8 },
    budget: { fact: 12000, planned: 16000 },
    estimate: { planned: 8, fact: 6 },
    ratio: 0.75,
    due_date: new Date('2026-09-10'),
    created_by: 1,
    created_at: new Date('2026-08-10'),
    overdueDays: 0,
    assignees: [
      {
        id: 1,
        task_id: 1,
        user_id: 1,
        user_name: 'Алексей К.',
        role_in_task: 'Frontend',
        hours: 6,
        planned: 8,
        tenant_id: 1,
        assigned_at: new Date(),
        is_active: true,
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
    id: 2,
    project_id: 1,
    title: 'Рефакторинг модуля авторизации',
    status: 'IN_PROGRESS',
    hours: { fact: 26, planned: 16 },
    budget: { fact: 78000, planned: 48000 },
    estimate: { planned: 16, fact: 26 },
    ratio: 1.63,
    due_date: new Date('2026-09-08'),
    created_by: 1,
    created_at: new Date('2026-08-01'),
    overdueDays: 8,
    note: {
      kind: 'danger',
      label: 'Причина',
      text: 'недооценил объём — задача > 8 ч, надо было дробить',
    },
    assignees: [
      {
        id: 2,
        task_id: 2,
        user_id: 2,
        user_name: 'Мария С.',
        role_in_task: 'Backend',
        hours: 18,
        planned: 10,
        tenant_id: 1,
        assigned_at: new Date('2026-08-01'),
        is_active: true,
      },
      {
        id: 3,
        task_id: 2,
        user_id: 3,
        user_name: 'Иван П.',
        role_in_task: 'Backend',
        hours: 8,
        planned: 6,
        tenant_id: 1,
        assigned_at: new Date('2026-08-01'),
        is_active: true,
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
    id: 3,
    project_id: 1,
    title: 'Исследовать варианты кэширования',
    status: 'OPEN',
    hours: { fact: 4, planned: 8 },
    budget: { fact: 20000, planned: 40000 },
    estimate: { planned: 8, fact: 4 },
    ratio: null,
    due_date: new Date('2026-09-20'),
    created_by: 1,
    created_at: new Date('2026-08-05'),
    overdueDays: 0,
    note: {
      kind: 'info',
      label: 'Timebox',
      text: 'исследование — оценка нестабильна, ограничено 8 ч',
    },
    assignees: [
      {
        id: 4,
        task_id: 3,
        user_id: 4,
        user_name: 'Дмитрий П.',
        role_in_task: 'Tech Lead',
        hours: 2,
        planned: 4,
        tenant_id: 1,
        assigned_at: new Date('2026-08-05'),
        is_active: true,
      },
      {
        id: 5,
        task_id: 3,
        user_id: 5,
        user_name: 'Елена С.',
        role_in_task: 'Backend',
        hours: 1.5,
        planned: 3,
        tenant_id: 1,
        assigned_at: new Date('2026-08-05'),
        is_active: true,
      },
      {
        id: 6,
        task_id: 3,
        user_id: 6,
        user_name: 'Олег Р.',
        role_in_task: 'DevOps',
        hours: 0.5,
        planned: 1,
        tenant_id: 1,
        assigned_at: new Date('2026-08-05'),
        is_active: true,
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