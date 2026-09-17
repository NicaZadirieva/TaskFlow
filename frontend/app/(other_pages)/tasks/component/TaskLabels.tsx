'use client';

import React from 'react';
import { Space, Tag, Tooltip, Popover } from 'antd';
import { labelColors } from '../utils/labelColor';
import { GithubLabel } from './Task';


interface Props {
  labels: GithubLabel[];
  max?: number;
  onSelect?: (label: GithubLabel) => void;
}

export const TaskLabels: React.FC<Props> = ({ labels, max = 4, onSelect }) => {
  if (!labels?.length) return null;

  const visible = labels.slice(0, max);
  const hidden = labels.slice(max);

  const renderTag = (l: GithubLabel) => {
    const c = labelColors(l.color);
    return (
      <Tooltip key={l.id ?? l.name} title={l.description || undefined}>
        <Tag
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(l);
          }}
          style={{
            margin: 0,
            cursor: onSelect ? 'pointer' : 'default',
            background: c.bg,
            borderColor: c.border,
            color: c.text,
            fontWeight: 600,
            fontSize: 11,
            lineHeight: '18px',
            padding: '0 8px',
            borderRadius: 999,
          }}
        >
          {l.name}
        </Tag>
      </Tooltip>
    );
  };

  return (
    <Space size={4} wrap>
      {visible.map(renderTag)}
      {hidden.length > 0 && (
        <Popover
          trigger="click"
          content={
            <Space orientation="vertical" size={6}>
              {hidden.map(renderTag)}
            </Space>
          }
        >
          <Tag
            style={{
              margin: 0,
              borderRadius: 999,
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            +{hidden.length}
          </Tag>
        </Popover>
      )}
    </Space>
  );
};