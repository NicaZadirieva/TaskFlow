import isMockEnabled from '@/utils/isMockEnabled';
import getProjectsMock from '../req.mock';
import { getProjectsServerReal } from './req.real';

export default async function getProjectsServerReq(id?: string) {
	return isMockEnabled() ? getProjectsMock(id) : getProjectsServerReal(id);
}

export function currentTime() { return Date.now() }
