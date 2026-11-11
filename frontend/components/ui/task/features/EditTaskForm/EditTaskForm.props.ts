import { NewTask, TaskWithoutCreatedBy } from '@/utils/types';

export interface TagOption {
	value: string;
	label: string;
}
export default interface EditTaskFormProps {
	tagsOptions?: TagOption[];
	projectOptions?: { value: number; label: string }[];
	onCancel?: () => void;
	saving?: boolean;
	task?: TaskWithoutCreatedBy | NewTask;
	saveTask?: (task: TaskWithoutCreatedBy | NewTask) => void | Promise<void>;
	updateTask: (task: TaskWithoutCreatedBy | NewTask) => void;
}
