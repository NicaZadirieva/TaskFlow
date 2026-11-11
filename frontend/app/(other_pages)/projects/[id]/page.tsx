import { notFound } from 'next/navigation';
import getProjectsServerReq from '@/api/requests/project/get_projects/server/req';
import RequestError from '@/api/utils/error';
import { ProjectTasksView } from '@/components/ui/project/widgets/ProjectViews';
import getCurrentUserServerReq from '@/api/requests/user/get_current_user/server/get_current_user.req';
import { TenantRole } from '@/api/types/user.types';
import ProjectBudgetEditor from '@/components/ui/project/widgets/ProjectBudgetEditor';
import getAllGithubLabelsReq from '@/api/requests/github_label/server/get_all.req';

export default async function ProjectTasksPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	if (!/^\d+$/.test(id)) notFound();
	let project;
	try { [project] = await getProjectsServerReq(id) } catch (error) {
		if (error instanceof RequestError && error.statusCode === 404) notFound();
		throw error;
	}
	const user = await getCurrentUserServerReq();
	const canCreate = user.role === TenantRole.OWNER || user.role === TenantRole.TEAM;
	const tags = canCreate ? await getAllGithubLabelsReq() : [];
	return <><ProjectTasksView project={project} canCreate={canCreate} tagsOptions={tags.map(({ name }) => ({ value: name, label: name }))} />{user.role === TenantRole.OWNER && <ProjectBudgetEditor project={project} />}</>;
}

