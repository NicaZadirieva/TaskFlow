import { TaskWithoutCreatedBy } from "@/utils/types";

export interface TagOption {
    value: string;
    label: string;
}
export default interface EditTaskFormProps {
    tagsOptions?: TagOption[];
    task?: TaskWithoutCreatedBy;
    saveTask: (task: TaskWithoutCreatedBy) => Promise<void>;
    updateTask: (task: TaskWithoutCreatedBy) => void;
}