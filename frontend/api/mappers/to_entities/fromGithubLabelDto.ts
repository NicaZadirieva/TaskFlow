import GithubLabel from "@/api/types/github-label.types";
import { GithubLabel as GithubLabelEntity } from "@/entities/githubLabel.interface";

export function fromGithubLabelDto(src: GithubLabel) {
    return src as GithubLabelEntity;
}