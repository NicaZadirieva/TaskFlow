import { GithubLabel } from "@/entities/githubLabel.interface";
import { Priority, Status } from "@/entities/task.interface";

export default interface TaskHeaderProps {
    id?: number;
    status: Status;
    priority: Priority;
    title: string;
    description?: string;
    tags?: GithubLabel[]
}