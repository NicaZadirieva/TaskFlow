import GithubLabel from "@/api/types/github-label.types";

export default async function getAllGithubLabelsReqMock(): Promise<GithubLabel[]>{
    return [
        {name: "frontend"},
        {name: "backend"}
    ]
}