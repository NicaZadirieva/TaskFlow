import isMockEnabled from '@/utils/isMockEnabled';
import createProjectMock from '../req.mock';
import type { CreateProjectRequest } from '../types';
import { createProjectClientReal } from './req.real';

export default async function createProjectClientReq(data: CreateProjectRequest) {
	return isMockEnabled() ? createProjectMock() : createProjectClientReal(data);
}

