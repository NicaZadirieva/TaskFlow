import { GithubLabel } from "@/entities/githubLabel.interface";
import GithubLabelOut from "../GithubLabelOut";

export default function fromGithubLabelOut(githubLabelDto: GithubLabelOut) {
    return githubLabelDto as GithubLabel;
}