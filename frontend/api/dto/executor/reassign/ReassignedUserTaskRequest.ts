export default interface ReassignedUserTaskRequest {
	task_id: number;
	user_id: number;
	reassigned_reason?: string;
}