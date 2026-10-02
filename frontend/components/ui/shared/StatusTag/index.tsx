import { Tag } from 'antd';
import { Status } from '../../../interfaces/task.interface';

const STATUS_META: Record<Status, { color: string; label: string }> = {
  OPEN: { color: 'blue', label: 'open' },
  IN_PROGRESS: { color: 'orange', label: 'in progress' },
  DONE: { color: 'green', label: 'done' },
  BACKLOG: {color: 'yellow', label: 'backlog'}
};

export default function StatusTag({ status } : {status: Status}) {
	return (
		<Tag color={STATUS_META[status].color}>
            {STATUS_META[status].label}
          </Tag>
	)
}