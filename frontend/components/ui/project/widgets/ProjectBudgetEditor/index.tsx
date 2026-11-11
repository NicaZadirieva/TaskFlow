'use client';
import { Button, Card, Form, InputNumber, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ProjectSummary } from '@/api/requests/project/get_projects/types';
import getBackendUrl from '@/utils/getBackendUrl';
import isMockEnabled from '@/utils/isMockEnabled';

export default function ProjectBudgetEditor({ project }: { project: ProjectSummary }) {
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [messageApi, contextHolder] = message.useMessage();
	const router = useRouter();
	const submit = async (values: { budget?: number | null; budget_hours?: number | null }) => {
		setSaving(true);
		try {
			if (!isMockEnabled()) {
				const response = await fetch(`${getBackendUrl()}/project/${project.id}/budget`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ budget: values.budget ?? null, budget_hours: values.budget_hours ?? null }) });
				if (!response.ok) throw new Error('Request failed');
			}
			setEditing(false); router.refresh();
		} catch { messageApi.error('Не удалось сохранить бюджет проекта'); } finally { setSaving(false) }
	};
	return <>{contextHolder}{editing ? <Card title="Редактирование бюджета и часов">
		<Form layout="vertical" initialValues={{ budget: project.budget == null ? null : Number(project.budget), budget_hours: project.budget_hours == null ? null : Number(project.budget_hours) }} onFinish={submit}>
			<Form.Item label="Бюджет, ₽" name="budget"><InputNumber min={0} max={99999999.99} precision={2} style={{ width: '100%' }} /></Form.Item>
			<Form.Item label="Часы работ" name="budget_hours"><InputNumber min={0} max={99999999.99} precision={2} style={{ width: '100%' }} /></Form.Item>
			<Button type="primary" htmlType="submit" loading={saving}>Сохранить</Button>{' '}<Button onClick={() => setEditing(false)}>Отмена</Button>
		</Form>
	</Card> : <Button onClick={() => setEditing(true)}>Изменить бюджет и часы</Button>}</>;
}
