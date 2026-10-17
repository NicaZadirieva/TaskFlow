export default interface CreateExecutorRequest {
    task_id: number;
    login: string;
    role_in_task: string;
    hours?: number;
    planned?: number;
    hourly_rate?: number;
}