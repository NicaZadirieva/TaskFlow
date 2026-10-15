import { TaskWithoutCreatedBy } from "@/utils/types";
import toExecutorDto from "./executor";

export default function toTaskWithoutCreatedByDto(task: TaskWithoutCreatedBy) {
    return {
        ...task,

        estimated_hours: task.hours?.planned,
        estimated_budget: task.budget?.planned,
        actual_budget: task.budget?.fact,
        actual_hours: task.hours?.fact,
        ...{ assignees: task.assignees.map(toExecutorDto) }
    }
}