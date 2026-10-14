import getAllGithubLabelsReq from '@/api/requests/github_label/get_all.req';
import { TaskAdditor } from '@/components/ui/task';

export default async function AddTaskPage() {
	const tagsOptions = await getAllGithubLabelsReq();
	return <TaskAdditor tagsOptions={tagsOptions.map((tag) => {return {
		value: tag.name,
		label: tag.name
	}})}/>
}