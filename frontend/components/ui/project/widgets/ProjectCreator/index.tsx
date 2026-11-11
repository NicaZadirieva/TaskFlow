'use client';

import { Button, Card, Form, Input, InputNumber, Select, Typography, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import createProjectClientReq from '@/api/requests/project/create_project/client/req';
import type { CreateProjectRequest } from '@/api/requests/project/create_project/types';
import RequestError from '@/api/utils/error';
import styles from '../../index.module.css';

export default function ProjectCreator({ clients }: { clients: { value: number; label: string }[] }) {
	const router = useRouter();
	const [saving, setSaving] = useState(false);
	const [messageApi, contextHolder] = message.useMessage();
	const submit = async (values: CreateProjectRequest) => {
		setSaving(true);
		try {
			await createProjectClientReq({ ...values, name: values.name.trim(), deadline: values.deadline ? `${values.deadline}T00:00:00` : null });
			router.push('/projects');
			router.refresh();
		} catch (error) {
			messageApi.error(error instanceof RequestError ? error.message : 'Не удалось создать проект');
		} finally { setSaving(false) }
	};
	return <main className={styles.page}>{contextHolder}
		<Typography.Title level={2}>Создание проекта</Typography.Title>
		<Card style={{ maxWidth: 640 }}><Form layout="vertical" onFinish={submit}>
			<Form.Item label="Название" name="name" rules={[{ required: true, whitespace: true, message: 'Введите название' }, { max: 100, message: 'Не более 100 символов' }]}><Input maxLength={100} /></Form.Item>
			<Form.Item label="Описание" name="description"><Input.TextArea rows={3} /></Form.Item>
			<Form.Item label="Бюджет, ₽" name="budget"><InputNumber min={0} max={99999999.99} precision={2} style={{ width: '100%' }} /></Form.Item>
			<Form.Item label="Часы работ" name="budget_hours"><InputNumber min={0} max={99999999.99} precision={2} style={{ width: '100%' }} /></Form.Item>
			<Form.Item label="Срок" name="deadline"><Input type="date" /></Form.Item>
			<Form.Item label="Клиент" name="client_id"><Select allowClear placeholder="Не выбран" options={clients} /></Form.Item>
			<Button type="primary" htmlType="submit" loading={saving}>Создать проект</Button>{' '}
			<Button onClick={() => router.push('/projects')}>Отмена</Button>
		</Form></Card>
	</main>;
}
