import isMockEnabled from '@/utils/isMockEnabled';
import getProjectsMock from '../req.mock';
import { getProjectsClientReal } from './req.real';

export default async function getProjectsClientReq(id?: string) {
	return isMockEnabled() ? getProjectsMock(id) : getProjectsClientReal(id);
}
