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

const ACTIVE_COLOR = '#1890ff';

export default function MultipleFilterDropdown({
    iconSrc,
    storage,
    optionsGroupName,
    widthInPx,
    showSearch = false,
    value,
    onChange,
}: MultipleFilterDropdownProps) {
    // fallback для неконтролируемого использования
    const [local, setLocal] = useState<string[]>([]);
    const isControlled = value !== undefined && onChange !== undefined;
    const selected = isControlled ? value! : local;

    const handleChange = (next: string[]) => {
        if (isControlled) onChange!(next);
        else setLocal(next);
    };

    return (
        <Select
            style={{
                width: `${widthInPx}px`,
                ...(selected.length > 0 && {
                    backgroundColor: '#e6f4ff',
                    boxShadow: `0 0 0 1px ${ACTIVE_COLOR} inset`,
                }),
            }}
            mode="multiple"
            value={selected}
            onChange={(v) => handleChange((v ?? []) as string[])}
            showSearch={showSearch ? { optionFilterProp: 'label' } : false}
            maxTagCount={0}
            maxTagPlaceholder={(omittedValues) =>
                renderLabel(omittedValues.length, optionsGroupName)
            }
            placeholder={renderLabel(0, optionsGroupName)}
            options={storage}
            optionRender={(option) => {
                const v = String(option.value ?? '');
                const l = String(option.label ?? '');
                const dot = (option.data as any)?.dotHexColor;
                return (
                    <ColoredFilterOption
                        key={v}
                        data={{ label: l, value: v, dotHexColor: dot }}
                        isActive={selected.includes(v)}
                        dotHexColor={dot}
                    />
                );
            }}
        />
    );
}