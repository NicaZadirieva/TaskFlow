'use client';

import Link from 'next/link';
import { ArrowLeftOutlined, ArrowRightOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, List, Modal, Progress, Row, Space, Tag, Typography } from 'antd';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TaskCreator from '@/components/ui/task/widgets/TaskCreator';
import type { ProjectSummary } from '@/api/requests/project/get_projects/types';
import styles from '../../index.module.css';

const labels: Record<string, string> = { OPEN: 'Открыта', BACKLOG: 'В очереди', IN_PROGRESS: 'В работе', DONE: 'Готово' };
const colors: Record<string, string> = { OPEN: 'blue', BACKLOG: 'default', IN_PROGRESS: 'processing', DONE: 'success' };

function TaskList({ tasks, limit }: { tasks: ProjectSummary['tasks']; limit?: number }) {
	return <List size="small" dataSource={limit ? tasks.slice(0, limit) : tasks}
		locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет задач" /> }}
		renderItem={(task) => <List.Item extra={<Tag color={colors[task.status]}>{labels[task.status] ?? task.status}</Tag>}><Link href={`/task/${task.id}`}>{task.title}</Link></List.Item>} />;
}

export function ProjectsView({ projects, now }: { projects: ProjectSummary[]; now: number }) {
	return <main className={styles.page}>
		<div className={styles.heading}><Typography.Title level={2}>Проекты</Typography.Title><Typography.Text type="secondary">Доступные проекты и их прогресс</Typography.Text></div>
		{projects.length === 0 ? <Empty description="Нет доступных проектов" /> : <Row gutter={[20, 20]}>
			{projects.map((project) => {
				const remaining = project.deadline ? new Date(project.deadline).getTime() - now : null;
				const urgent = remaining !== null && remaining >= 0 && remaining < 30 * 86400000;
				return <Col xs={24} md={12} xl={8} key={project.id}><Card className={`${styles.card} ${urgent ? styles.urgent : ''}`} title={project.name} extra={urgent ? <Tag color="gold">Скоро срок</Tag> : undefined}>
					<Space orientation="vertical" size="middle" className={styles.content}>
						<Space orientation="vertical" size={4}>
							<Typography.Text>Бюджет: {project.budget ?? 'Не указан'}{project.budget != null && ' ₽'}</Typography.Text>
							<Typography.Text><ClockCircleOutlined /> Часы работ: {project.budget_hours ?? 'Не указаны'}{project.budget_hours != null && ' ч'}</Typography.Text>
							<Typography.Text><CalendarOutlined /> Срок: {project.deadline ? new Date(project.deadline).toLocaleDateString('ru-RU') : 'Не указан'}</Typography.Text>
						</Space>
						<div><Typography.Text strong>Прогресс</Typography.Text><Progress percent={project.progress} /></div>
						<div><Typography.Text strong>Задачи</Typography.Text><TaskList tasks={project.tasks} limit={5} />{project.tasks.length > 5 && <Typography.Text type="secondary">Ещё задач: {project.tasks.length - 5}</Typography.Text>}</div>
						<Link href={`/projects/${project.id}`}><Button type="primary" icon={<ArrowRightOutlined />} iconPlacement="end">Перейти к задачам</Button></Link>
					</Space>
				</Card></Col>;
			})}
		</Row>}
	</main>;
}

export function ProjectTasksView({ project, canCreate, tagsOptions }: { project: ProjectSummary; canCreate: boolean; tagsOptions: { value: string; label: string }[] }) {
	const [creating, setCreating] = useState(false);
	const router = useRouter();
	return <main className={styles.page}>
		<Link href="/projects"><Button type="link" icon={<ArrowLeftOutlined />} className={styles.back}>Все проекты</Button></Link>
		<Typography.Title level={2}>Задачи проекта «{project.name}»</Typography.Title>
		{canCreate && <Button type="primary" onClick={() => setCreating(true)}>Создать задачу</Button>}
		<Card><TaskList tasks={project.tasks} /></Card>
		<Modal title={`Новая задача проекта «${project.name}»`} open={creating} onCancel={() => setCreating(false)} footer={null} width={1100} destroyOnHidden>
			<TaskCreator fixedProjectId={project.id} projectOptions={[]} tagsOptions={tagsOptions} onCancel={() => setCreating(false)} onCreated={() => { setCreating(false); router.refresh() }} />
		</Modal>
	</main>;
}

