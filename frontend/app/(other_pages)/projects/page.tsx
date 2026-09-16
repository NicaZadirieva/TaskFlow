import getProjectsReq from '../api/get_projects/get_projects.req';
import ProjectTable from './widgets/ProjectTable';

export default async function ProjectsPage() {
	const projects = await getProjectsReq();
	if (projects) {
		return <ProjectTable projects={projects}/>
	}
	return <p>Проектов пока нет</p>
}