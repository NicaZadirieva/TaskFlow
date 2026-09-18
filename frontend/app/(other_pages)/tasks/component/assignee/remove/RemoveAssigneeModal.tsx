import { message, Modal, Select, Typography } from 'antd';
import { useState } from 'react';
import { Assignee } from '../../../interface/assignee.interface';
import TextArea from 'antd/es/input/TextArea';

const { Text } = Typography;
const REMOVE_REASONS = [
  { value: 'заболел', label: 'Заболел' },
  { value: 'отпуск', label: 'Отпуск' },
  { value: 'переведён на другой проект', label: 'Переведён на другой проект' },
  { value: 'не хватает компетенций', label: 'Не хватает компетенций' },
  { value: 'конфликт интересов', label: 'Конфликт интересов' },
  { value: 'задача отменена', label: 'Задача отменена' },
  { value: '__custom', label: 'Другое…' },
];

export default function RemoveAssigneeModal({isOpen, onClose, onRemove, assignee}: {assignee: Assignee, onRemove: (newAssignee: Assignee) => void, isOpen: boolean, onClose: () => void}) {
	const [removeReason, setRemoveReason] = useState<string>('');
	const [customReason, setCustomReason] = useState<string>('');


  const closeRemoveModal = () => {
    setRemoveReason('');
    setCustomReason('');
  };

  const confirmRemove = async () => {
    const reason =
      removeReason === '__custom' ? customReason.trim() : removeReason;
    if (!reason) {
      message.warning('Укажите причину удаления');
      return;
    }
	const newAssignee = { ...assignee, removed: true, removeReason: reason };
    await onRemove(newAssignee);

    message.success(`${newAssignee.user_name} удалён: ${reason}`);
    closeRemoveModal();
  };

  const canConfirm =
    removeReason === '__custom'
      ? customReason.trim().length > 0
      : removeReason.length > 0;
	return (
		<Modal
        open={isOpen}
        title="Удалить исполнителя"
        onCancel={onClose}
        onOk={confirmRemove}
        okText="Удалить"
        cancelText="Отмена"
        okButtonProps={{ danger: true, disabled: !canConfirm }}
        destroyOnHidden
      >
        
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {assignee.user_name} · {assignee.role_in_task}
            </Text>

            <div>
              <Text
                type="secondary"
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 0.3,
                }}
              >
                Причина удаления
              </Text>
              <Select
                style={{ width: '100%', marginTop: 4 }}
                placeholder="Выберите причину"
                value={removeReason || undefined}
                onChange={setRemoveReason}
                options={REMOVE_REASONS}
              />
            </div>

            {removeReason === '__custom' && (
              <TextArea
                autoFocus
                rows={3}
                placeholder="Опишите причину"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                maxLength={200}
                showCount
              />
            )}
          </div>

      </Modal>
	)
}