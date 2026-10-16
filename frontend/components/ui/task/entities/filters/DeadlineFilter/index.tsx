'use client';


import { useTaskFilters } from '@/hooks/useTaskFilters';
import { Deadline } from '@/lib/taskFilters';
import type { SelectProps } from 'antd';
import { Select } from 'antd';

const deadlineOptions: SelectProps['options'] = [
    { value: 'overdue', label: 'Просрочено' },
    { value: 'today', label: 'Остался 1 день' },
    { value: 'this_week', label: 'Через 2–4 дня' },
    { value: 'next_week', label: 'Более чем через неделю' },
    { value: 'done', label: 'Сдано' },
];

export default function DeadlineFilter() {
    const { filters, setFilters } = useTaskFilters();

    return (
        <Select
            mode="multiple"
            allowClear
            placeholder="Дедлайн"
            options={deadlineOptions}
            value={filters.deadline}
            onChange={(vals) =>
                setFilters({ deadline: (vals ?? []) as Deadline[] })
            }
            style={{ minWidth: 250 }}
            maxTagCount="responsive"
            showSearch={false}
        />
    );
}