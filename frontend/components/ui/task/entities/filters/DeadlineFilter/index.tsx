'use client';

import { useTaskFilters } from '@/hooks/useTaskFilters';
import type { TaskDeadline } from '@/lib/taskFilters';

import { Select } from 'antd';
import type { CSSProperties, ReactElement } from 'react';

type MultipleSelectProps<T> = {
	mode: 'multiple';
	value?: T[];
	onChange?: (value: T[]) => void;
	options?: { value: T; label: string }[];
	allowClear?: boolean;
	placeholder?: string;
	style?: CSSProperties;
	maxTagCount?: number | 'responsive';
	showSearch?: boolean;
};

// antd не сужает тип по mode="multiple" → сужаем сами.
const MultipleSelect = Select as unknown as <T>(
	props: MultipleSelectProps<T>
) => ReactElement;

const deadlineOptions: { value: TaskDeadline; label: string }[] = [
	{ value: 'overdue', label: 'Просрочено' },
	{ value: 'today', label: 'Остался 1 день' },
	{ value: 'this_week', label: 'Через 2–4 дня' },
	{ value: 'next_week', label: 'Более чем через неделю' },
	{ value: 'done', label: 'Сдано' },
];

export default function DeadlineFilter() {
	const { filters, setFilters } = useTaskFilters();

	return (
		<MultipleSelect<TaskDeadline>
			mode="multiple"
			allowClear
			placeholder="Дедлайн"
			options={deadlineOptions}
			value={filters.deadline}
			onChange={(vals) => setFilters({ deadline: vals ?? [] })}
			style={{ minWidth: 250 }}
			maxTagCount="responsive"
			showSearch={false}
		/>
	);
}