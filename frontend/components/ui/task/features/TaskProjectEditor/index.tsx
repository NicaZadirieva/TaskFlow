'use client';

import { Button, Card, Form, Select, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import updateTaskProject from '@/api/requests/task/update_project/client/req';

export default function TaskProjectEditor({ taskId, projectId, options }: { taskId: number; projectId?: number; options: { value: number; label: string }[] }) {
	const [value, setValue] = useState<number | null>(projectId ?? null);
	const [saving, setSaving] = useState(false);
	const [messageApi, contextHolder] = message.useMessage();
	const router = useRouter();
	const save = async () => {
		setSaving(true);
		try {
			await updateTaskProject(taskId, value);
			messageApi.success('Проект задачи сохранён');
			router.refresh();
		} catch (error) {
			messageApi.error(error instanceof Error ? error.message : 'Не удалось сохранить проект');
		} finally { setSaving(false) }
	};
	return <Card title="Проект задачи">{contextHolder}<Form layout="vertical" onFinish={save}>
		<Form.Item label="Проект"><Select value={value ?? undefined} onChange={(next) => setValue(next ?? null)} options={options} allowClear showSearch optionFilterProp="label" placeholder="Без проекта" /></Form.Item>
		<Button type="primary" htmlType="submit" loading={saving}>Сохранить проект</Button>
	</Form></Card>;
}
