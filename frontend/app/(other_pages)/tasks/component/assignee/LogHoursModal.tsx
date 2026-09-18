'use client';


import { useEffect, useState } from 'react';
import { InputNumber, Modal, Space, Typography, Alert, Input } from 'antd';
import { Assignee } from '../../interface/assignee.interface';


const { Text } = Typography;

interface Props {
  open: boolean;
  assignee: Assignee | null;
  taskTitle?: string;
  onClose: () => void;
  onSave: (hours: number, comment?: string) => Promise<void> | void;
}

export default function LogHoursModal({
  open,
  assignee,
  taskTitle,
  onClose,
  onSave,
}: Props) {
  const [hours, setHours] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [saving, setSaving] = useState(false);

  


 
  
  useEffect(() => {
    if (open && assignee) {
      setHours(assignee.hours);
      setComment('');
    }
  }, [open, assignee]);

  const delta = assignee ? hours - assignee.hours : 0;
  const overdue = assignee ? hours > assignee.planned : false;

  const handleSave = async () => {
    if (!assignee) return;
    try {
      setSaving(true);
      await onSave(hours, comment.trim() || undefined);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Внести фактические часы"
      onCancel={onClose}
      onOk={handleSave}
      okText="Сохранить"
      cancelText="Отмена"
      confirmLoading={saving}
      destroyOnHidden
    >
      {assignee && (
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
          {taskTitle && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {taskTitle}
            </Text>
          )}

          <div>
            <Text style={{ fontWeight: 600 }}>{assignee.name}</Text>
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
              {assignee.role}
            </Text>
          </div>

          <div>
            <Text
              type="secondary"
              style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 0.3,
                display: 'block',
                marginBottom: 4,
              }}
            >
              Всего фактических часов
            </Text>
            <InputNumber
              min={0}
              step={0.5}
              value={hours}
              onChange={(v) => setHours(Number(v) || 0)}
              style={{ width: '100%' }}
              autoFocus
            />
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
              План: {assignee.planned} ч
              {delta !== 0 && (
                <>
                  {' · '}
                  <span style={{ color: delta > 0 ? '#dc2626' : '#16a34a' }}>
                    {delta > 0 ? '+' : ''}
                    {delta} ч
                  </span>
                </>
              )}
            </Text>
          </div>

          {overdue && (
            <Alert
              type="warning"
              showIcon
              title={`Превышение плана на ${(hours - assignee.planned).toFixed(1)} ч`}
            />
          )}

          <div>
            <Text
              type="secondary"
              style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 0.3,
                display: 'block',
                marginBottom: 4,
              }}
            >
              Комментарий (необязательно)
            </Text>
            <Input.TextArea
              rows={2}
              maxLength={200}
              showCount
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Что делали, что осталось…"
            />
          </div>
        </Space>
      )}
    </Modal>
  );
}