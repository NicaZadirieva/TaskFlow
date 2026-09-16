export interface IProject {
	id: number;
	tenant_id: number; 
	name: string;
	description?: string;
	budget_hours?: number;
	deadline?: Date;
}