import { Status } from '@/entities/task.interface';
import { Tag } from 'antd';


const STATUS_META: Record<Status, { color: string; label: string }> = {
  OPEN: { color: 'blue', label: 'OPEN' },
  IN_PROGRESS: { color: 'orange', label: 'in progress' },
  DONE: { color: 'green', label: 'done' },
  BACKLOG: {color: 'yellow', label: 'BACKLOG'}
};

export default function StatusTag({ status } : {status: Status}) {
	return (
		<Tag color={STATUS_META[status].color}>
            {STATUS_META[status].label}
    </Tag>
	)
}