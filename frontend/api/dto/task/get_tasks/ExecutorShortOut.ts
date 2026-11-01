export interface ExecutorShortOut {
    id: number;
    user_id: number;

    name: string;
    login: string;
    email: string;

    role_in_task: string;
    is_active: boolean;
    removed: boolean;

    hours?: number | null;
    planned?: number | null;

    hourly_rate?: number | null;
    remove_reason?: string | null;
    reassigned_reason?: string | null;
}