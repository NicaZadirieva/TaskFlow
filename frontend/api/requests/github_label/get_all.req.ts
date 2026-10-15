import GithubLabel from "@/api/types/github-label.types";
import isMockEnabled from "@/utils/isMockEnabled";
import getAllGithubLabelsReqMock from "./get_all.req.mock";
import getAllGithubLabelsReqReal from "./get_all.req.real";


export default async function getAllGithubLabelsReq(): Promise<GithubLabel[]> {
    if (isMockEnabled()) {
        return await getAllGithubLabelsReqMock();
    }
    return await getAllGithubLabelsReqReal();
}