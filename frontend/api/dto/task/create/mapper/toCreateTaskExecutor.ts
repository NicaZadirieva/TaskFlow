import { Executor } from "@/entities/executor.interface";
import CreateTaskExecutor from "../CreateTaskExecutor";

export default function toCreateTaskExecutor(executor: Executor) {
    return executor as CreateTaskExecutor;
}