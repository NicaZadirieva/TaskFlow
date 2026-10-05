'use client';

import { Select } from 'antd';
import { useState } from 'react';
import ColoredFilterOption from '../../../shared/ColoredFilterOption';
import MultipleFilterDropdownProps from './MultipleFilterDropdownProps.props';


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
const renderLabel = (count: number, filterName: string) => (
    <span
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'rgba(0, 0, 0, 0.88)',
        }}
    >
        {filterName}
        <span style={badgeStyle}>{count}</span>
    </span>
);

export default function MultipleFilterDropdown({
    iconSrc,
    storage,
    optionsGroupName,
    widthInPx
}: MultipleFilterDropdownProps) {
    const [activeOptions, updateActiveOptions] = useState<string[]>([]);
    return (

        <Select
            mode="multiple"
            // Отключаем поиск / автокомплит
            showSearch={false}
            // Скрываем все теги
            maxTagCount={0}
            // Показывается, когда есть выбранные значения
            maxTagPlaceholder={(omittedValues) => renderLabel(omittedValues.length, optionsGroupName)}
            // Показывается, когда ничего не выбрано
            placeholder={renderLabel(0, optionsGroupName)}

            style={{ width: `${widthInPx}px` }}
           
            onChange={(values) => updateActiveOptions(values as string[])}
            options={storage}
                optionRender = {(option) => {
                    const value = String(option.value ?? '');
                    const label = String(option.label ?? '');

                    return (
                        <ColoredFilterOption
                            key={value}
                            data={{ label, value, dotHexColor: option.data.dotHexColor }}
                            isActive={!!activeOptions?.includes(value)}
                            dotHexColor={option.data.dotHexColor}
                        />
                    );
                }
            }

            
        />
    );
}
