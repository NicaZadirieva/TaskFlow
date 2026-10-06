'use client';

import type { SelectProps } from 'antd';
import { Select } from 'antd';

const deadlineOptions: SelectProps['options'] = [
    { value: 'overdue', label: 'Просрочено' },
    { value: 'today', label: 'Остался 1 день' },
    { value: 'this_week', label: 'Через 2–4 дня' },
    { value: 'next_week', label: 'Более чем через неделю' },
    { value: 'done', label: 'Сдано' },
];

interface DeadlineFilterProps {
    value?: string[];
    onChange?: (value: string[]) => void;
}

export default function DeadlineFilter({ value, onChange }: DeadlineFilterProps) {
    return (
        <Select
            mode="multiple"
            allowClear
            placeholder="Дедлайн"
            options={deadlineOptions}
            value={value}
            onChange={onChange}
            style={{ minWidth: 250 }}
            maxTagCount="responsive"
            showSearch={false}
        />
    );
}
