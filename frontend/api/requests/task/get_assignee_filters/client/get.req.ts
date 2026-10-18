import isMockEnabled from "@/utils/isMockEnabled";
import getAssigneeFiltersMock from "../get.req.mock";
import getAssigneeFiltersClientRealReq from "./get.req.real";

export default async function getAssigneeFiltersClientReq() {
    if (isMockEnabled()) {
        return await getAssigneeFiltersMock();
    }
    return await getAssigneeFiltersClientRealReq();
}