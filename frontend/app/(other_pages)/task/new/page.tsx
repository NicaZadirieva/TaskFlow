import getAllGithubLabelsReq from '@/api/requests/github_label/server/get_all.req';
import { TaskCreator } from '@/components/ui/task';
import getProjectsServerReq from '@/api/requests/project/get_projects/server/req';

export default async function AddTaskPage() {
	const tagsOptions = await getAllGithubLabelsReq();
	const projects = await getProjectsServerReq();
	return <TaskCreator projectOptions={projects.map(({ id, name }) => ({ value: id, label: name }))} tagsOptions={tagsOptions.map((tag) => {return {
		value: tag.name,
		label: tag.name
	};})}/>;
}
