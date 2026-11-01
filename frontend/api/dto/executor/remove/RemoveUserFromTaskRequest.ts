export default interface RemoveUserFromTaskRequest {
	task_id: number;
	user_id: number;
	remove_reason?: string;
}