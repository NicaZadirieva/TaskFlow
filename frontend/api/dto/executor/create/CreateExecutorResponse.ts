export default interface CreateExecutorResponse {
	id: number;
	user_id: number;
	user_name: string;
	role_in_task: string;
	hours?: number;
	planned?: number;
	hourly_rate?: number;
	is_active: boolean;
	login: string;
	email: string;
};
