import { NewTask, TaskWithoutCreatedBy } from "@/utils/types";

export interface TagOption {
    value: string;
    label: string;
}
export default interface EditTaskFormProps {
    tagsOptions?: TagOption[];
    task?: TaskWithoutCreatedBy | NewTask;
    saveTask: (task: TaskWithoutCreatedBy | NewTask) => void;
    updateTask: (task: TaskWithoutCreatedBy | NewTask) => void;
}