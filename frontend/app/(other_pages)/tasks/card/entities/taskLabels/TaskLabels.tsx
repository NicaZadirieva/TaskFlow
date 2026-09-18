'use client';

import React from 'react';
import { Tag, Tooltip, Popover } from 'antd';
import { labelColors } from '../../../utils/labelColor';
import { GithubLabel } from '../../../interface/githubLabel.interface';
import styles from './TaskLabels.module.css';

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
          className={`${styles.tag} ${
            onSelect ? styles.tagClickable : styles.tagStatic
          }`}
          style={{
            background: c.bg,
            borderColor: c.border,
            color: c.text,
          }}
        >
          {l.name}
        </Tag>
      </Tooltip>
    );
  };

  return (
    <div className={styles.list}>
      {visible.map(renderTag)}
      {hidden.length > 0 && (
        <Popover
          trigger="click"
          content={
            <div className={styles.popoverContent}>
              {hidden.map(renderTag)}
            </div>
          }
        >
          <Tag className={styles.moreTag}>+{hidden.length}</Tag>
        </Popover>
      )}
    </div>
  );
};