import { ExecutorShortOut } from "./ExecutorShortOut";
import TagShortOut from "./TagShortOut";
import { TaskOut } from "./TaskOut";

export default interface TasksOut {
    items: TaskOut[];
    total: number;
    limit: number;
    offset: number;

    all_executors?: ExecutorShortOut[] | null;
    all_tags?: TagShortOut[] | null;
}