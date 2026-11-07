import { GithubLabel } from '@/entities/githubLabel.interface';
import GithubLabelOut from '../GithubLabelOut';

export default function fromGithubLabelOut(githubLabelDto: GithubLabelOut) {
	return {
		id: githubLabelDto.id,
		name: githubLabelDto.name,
		description: githubLabelDto.description
	} satisfies GithubLabel;
}