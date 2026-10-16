import type TagShortOut from "@/api/dto/task/get_tasks/TagShortOut";
import type { GithubLabel } from "@/entities/githubLabel.interface";

export function fromTagOut(dto: TagShortOut): GithubLabel {
    return {
        id: dto.id,
        name: dto.name
    };
}