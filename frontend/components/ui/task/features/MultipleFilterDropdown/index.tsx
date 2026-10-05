'use client';

import { Select } from 'antd';
import { useState } from 'react';
import type { FilterOptionData } from './MultipleFilterDropdownProps.props';
import MultipleFilterDropdownProps from './MultipleFilterDropdownProps.props';
import ColoredFilterOption from './ui/ColoredFilterOption';

const status: FilterOptionData[] = [
    { label: 'Критический', value: 'CRITICAL' },
    { label: 'Высокий', value: 'HIGH' },
    { label: 'Средний', value: 'MEDIUM' },
    { label: 'Низкий', value: 'LOW' },
];

const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
    height: 20,
    padding: '0 6px',
    borderRadius: 10,
    background: '#1890ff',
    color: '#fff',
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1,
};

// Единый рендер «Статус + кружок»
const renderLabel = (count: number) => (
    <span
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'rgba(0, 0, 0, 0.88)',
        }}
    >
        Статус
        <span style={badgeStyle}>{count}</span>
    </span>
);

export default function MultipleFilterDropdown({
    iconSrc,
    defaultActiveOptions,
    optionsGroupName,
}: MultipleFilterDropdownProps) {
    const [activeOptions, updateActiveOptions] = useState<string[]>(defaultActiveOptions);
    return (

        <Select
            mode="multiple"
            // Отключаем поиск / автокомплит
            showSearch={false}
            // Скрываем все теги
            maxTagCount={0}
            // Показывается, когда есть выбранные значения
            maxTagPlaceholder={(omittedValues) => renderLabel(omittedValues.length)}
            // Показывается, когда ничего не выбрано
            placeholder={renderLabel(0)}
            // Ширина по контенту, а не фиксированная
            style={{ width: '150px' }}
           
            onChange={(values) => updateActiveOptions(values as string[])}
            options={status}
                optionRender = {(option) => {
                    const value = String(option.value ?? '');
                    const label = String(option.label ?? '');

                    return (
                        <ColoredFilterOption
                            key={value}
                            data={{ label, value }}
                            isActive={!!activeOptions?.includes(value)}
                            dotHexColor={getColorByStatus(value)}
                        />
                    );
                }
            }

            
        />
    );
}

function getColorByStatus(value: string): string | undefined {
    switch (value) {
        case 'CRITICAL': return '#ff4d4f';
        case 'HIGH': return '#fa8c16';
        case 'MEDIUM': return '#722ed1';
        case 'LOW': return '#1890ff';
        default: return undefined;
    }
}
