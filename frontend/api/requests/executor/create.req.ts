import CreateExecutorRequest from "@/api/dto/executor/create/CreateExecutorRequest";
import isMockEnabled from "@/utils/isMockEnabled";
import createExecutorReqMock from "./create.req.mock";
import createExecutorReqReal, { CreateExecutorResult } from "./create.req.real";

export default async function createExecutorReq(dto: CreateExecutorRequest): Promise<CreateExecutorResult> {
    if (isMockEnabled()) {
        return await createExecutorReqMock(dto);
    }
    return await createExecutorReqReal(dto);
}