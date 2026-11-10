import RequestError from '@/api/utils/error';

export default async function createProjectMock(): Promise<never> {
	throw new RequestError('Создание проекта недоступно в деморежиме', 'MOCK');
}
