import { Suspense } from 'react';
import getTasksServerReq from '@/api/requests/task/get_tasks/server/req';


import {
	DeadlineFilter,
	PriorityTaskFilter,
	StatusTaskFilter,
	TasksInKanban,
	TasksInRow
} from '@/components/ui/task';
import AssigneesFilter from '@/components/ui/task/entities/filters/AssigneesFilter';
import TagsFilter from '@/components/ui/task/entities/filters/TagsFilter';

import getAssigneeFiltersServerReq from '@/api/requests/task/get_assignee_filters/server/get.req';
import getTagsFilterServerReq from '@/api/requests/task/get_tags_filter/server/get.req';
import { getUsersServerReq } from '@/api/requests/user/get_users/server/get_users.req.real';
import { filtersToSearchParams, parseFilters } from '@/lib/taskFiltersUrl';
import { toURLSearchParams } from '@/lib/toUrlSearchParams';
import styles from './page.module.css';
import getCurrentUserServerReq from '@/api/requests/user/get_current_user/server/get_current_user.req';
import { fromTaskDto } from '@/api/mappers';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ListAllTasksPage({
	searchParams
}: {
  searchParams: SearchParams;
}) {
	const sp = await toURLSearchParams(searchParams);
	const filters = parseFilters(sp);

	const [tasks, userData, assignees, tags] = await Promise.all([
		getTasksServerReq(filtersToSearchParams(filters)),
		getUsersServerReq().catch((e) => {
			// Справочник пользователей не критичен для отображения доски —
			// если упал, отдаём пустой список, форма добавления подтянет через useQuery.
			console.error('[ListAllTasksPage] users fetch failed', e);
			return { users: [] };
		}),
		getAssigneeFiltersServerReq().catch(() => []),
		getTagsFilterServerReq().catch(() => [])
	]);

	if (!tasks) return null;
	const mappedTasks = tasks.items.map(fromTaskDto);
	const currentUser = await getCurrentUserServerReq();


	return (
		<div style={{ background: '#f5f6f8', minHeight: '100vh', padding: 32 }}>
			<Suspense fallback={null}>
				<div className={styles.filters}>
					<PriorityTaskFilter />
					<StatusTaskFilter />
					{tags && <TagsFilter initialData={tags} />}
					{assignees && <AssigneesFilter initialData={assignees} />}
					<DeadlineFilter />
				</div>
			</Suspense>

			<TasksInRow
				currentUser={currentUser}
				initialTasks={mappedTasks}
				initialUsers={userData.users}
				search={sp.toString()}
			/>
		</div>
	);
}