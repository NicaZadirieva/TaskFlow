import GithubLabel from '@/api/types/github-label.types';

export default async function getAllGithubLabelsReqMock(): Promise<GithubLabel[]>{
	const data: GithubLabel[] = [
		{id: 0, name: 'frontend'},
		{id: 1, name: 'backend'}
	];
	return data;
}