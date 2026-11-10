import getProjectsServerReq, { currentTime } from '@/api/requests/project/get_projects/server/req';
import { ProjectsView } from '@/components/ui/project/widgets/ProjectViews';

export default async function ProjectsPage() {
	const projects = await getProjectsServerReq();
	return <ProjectsView projects={projects} now={currentTime()} />;
}


