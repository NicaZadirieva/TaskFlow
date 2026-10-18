import isMockEnabled from "@/utils/isMockEnabled";
import getAssigneeFiltersMock from "../get.req.mock";
import { getFilterAssigneesRealServer } from "./get.req.real";

export default async function getAssigneeFiltersServerReq() {
    if (isMockEnabled()) {
        return await getAssigneeFiltersMock();
    }
    return await getFilterAssigneesRealServer();
}