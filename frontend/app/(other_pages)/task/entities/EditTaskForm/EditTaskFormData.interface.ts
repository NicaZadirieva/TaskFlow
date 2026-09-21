import { GithubLabel } from '@/app/(other_pages)/tasks/interfaces/githubLabel.interface';
import { Priority, Status } from '@/app/(other_pages)/tasks/interfaces/task.interface';

export default interface EditTaskFormData {
	title: string;
	status: Status;
	description?: string;
	hours: { fact: number; planned: number; };
	budget: { fact: number; planned: number };
	due_date: Date;
	note?: { kind: 'danger' | 'info'; label: string; text: string };
	tags?: string[];
	priority: Priority;
	task_images?: string[];
}