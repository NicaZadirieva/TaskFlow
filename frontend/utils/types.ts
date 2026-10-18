import { Task } from "@/entities/task.interface";

export type TaskWithoutCreatedBy = Omit<Task, 'created_by'>;

export type NewTask = Omit<TaskWithoutCreatedBy, 'id'>
export type TaskWithoutAssignees = Omit<NewTask, "assignees">;