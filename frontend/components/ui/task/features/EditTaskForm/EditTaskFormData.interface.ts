import { Priority, Status } from '@/entities/task.interface';


export default interface EditTaskFormData {
	id?: number;
	project_id?: number | null;
	title: string;
	status: Status;
	description?: string;
	hours: { fact: number; planned: number; };
	budget: { fact: number; planned: number };
	due_date: Date | null;
	note?: { kind: 'danger' | 'info'; label: string; text: string };
	tags?: string[];
	priority: Priority;
	task_images?: string[];
}
