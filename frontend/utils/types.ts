import { Task } from "@/entities/task.interface";

export type TaskWithoutCreatedBy = Omit<Task, 'created_by'>;