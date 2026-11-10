export type CreateProjectRequest = {
	name: string;
	description?: string | null;
	budget_hours?: number | null;
	deadline?: string | null;
	client_id?: number | null;
};
export type CreateProjectResponse = { id: number };
