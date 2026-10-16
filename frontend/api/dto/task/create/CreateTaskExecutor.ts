export default interface CreateTaskExecutor {
    user_id: number;
    login: string;
    role_in_task: string;
    is_active: boolean;
    hours: number;
    planned: number;
    hourly_rate: number;
}