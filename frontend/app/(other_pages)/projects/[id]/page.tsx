import { notFound } from 'next/navigation';
import getProjectsServerReq from '@/api/requests/project/get_projects/server/req';
import RequestError from '@/api/utils/error';
import { ProjectTasksView } from '@/components/ui/project/widgets/ProjectViews';

export default async function ProjectTasksPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	if (!/^\d+$/.test(id)) notFound();
	let project;
	try { [project] = await getProjectsServerReq(id) } catch (error) {
		if (error instanceof RequestError && error.statusCode === 404) notFound();
		throw error;
	}
	return <ProjectTasksView project={project} />;
}

