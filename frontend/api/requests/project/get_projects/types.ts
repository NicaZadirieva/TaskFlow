export type ProjectSummary = {
	id: number; name: string; budget_hours: string | number | null; deadline: string | null;
	progress: number; tasks: { id: number; title: string; status: string }[];
};
