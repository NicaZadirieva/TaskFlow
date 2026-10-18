import isMockEnabled from "@/utils/isMockEnabled";
import getTagsFilterMock from "../get.req.mock";
import getTagsFiltersClientRealReq from "./get.req.real";

export default async function getTagsFiltersClientReq() {
    if (isMockEnabled()) {
        return await getTagsFilterMock();
    }
    return await getTagsFiltersClientRealReq();
}