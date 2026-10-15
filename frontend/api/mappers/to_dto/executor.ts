import { Executor as ExecutorDto } from "@/api/types/assigned-task.types";
import { Executor } from "@/entities/executor.interface";

export default function toExecutorDto(executor: Executor): ExecutorDto {
    return { ...executor, actual_hours: executor.hours, estimated_hours: executor.planned }
}