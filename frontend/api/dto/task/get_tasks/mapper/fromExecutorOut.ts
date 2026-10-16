import type { ExecutorShortOut } from "@/api/dto/task/get_tasks/ExecutorShortOut";
import type { Executor } from "@/entities/executor.interface";

export function fromExecutorOut(dto: ExecutorShortOut): Executor {
    return {
        id: dto.id,
        user_id: dto.user_id,
        user_name: dto.name,
        login: dto.login,
        email: dto.email,
        role_in_task: dto.role_in_task,
        is_active: dto.is_active,
        removed: dto.removed,
        hours: dto.hours ? dto.hours: 0,
        planned: dto.planned ? dto.planned : 0,
        hourly_rate: dto.hourly_rate ? dto.hourly_rate: 0,
        remove_reason: dto.remove_reason ? dto.remove_reason : undefined,
        reassigned_reason: dto.reassigned_reason ? dto.reassigned_reason : undefined,
    };
}