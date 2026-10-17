import CreateExecutorRequest from "@/api/dto/executor/create/CreateExecutorRequest";
import CreateExecutorResponse from "@/api/dto/executor/create/CreateExecutorResponse";
import { CreateExecutorResult } from "./create.req.real";

export default async function createExecutorReqMock(dto: CreateExecutorRequest): Promise<CreateExecutorResult> {
    return {
        data: {
            id: 1,
            user_id: 1,
            user_name: 'Nica',
            role_in_task: 'developer',
            hours: 1,
            planned: 1
        } as CreateExecutorResponse,
        success: true
    };
}