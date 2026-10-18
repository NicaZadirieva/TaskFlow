import isMockEnabled from "@/utils/isMockEnabled";
import getTagsFilterMock from "../get.req.mock";
import getTagsFilterServerReal from "./get.real.req";

export default async function getTagsFilterServerReq() {
    if (isMockEnabled()) {
        return await getTagsFilterMock();
    }
    return await getTagsFilterServerReal();
}