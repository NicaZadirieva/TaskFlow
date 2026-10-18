import { Suspense } from "react";

import fromGithubLabelOut from "@/api/dto/github_label/get_all/mappers/fromGithubLabelOut";
import { fromTaskOut } from "@/api/dto/task/get_tasks/mapper/fromTaskOut";
import getTasksServerReq from "@/api/requests/task/get_tasks/server/req";


import {
  DeadlineFilter,
  PriorityTaskFilter,
  StatusTaskFilter,
  TasksInKanban,
} from "@/components/ui/task";
import AssigneesFilter from "@/components/ui/task/entities/filters/AssigneesFilter";
import TagsFilter from "@/components/ui/task/entities/filters/TagsFilter";
import { FilterOptionData } from "@/components/ui/task/features/MultipleFilterDropdown/MultipleFilterDropdownProps.props";

import { getUsersServerReq } from "@/api/requests/user/get_users/server/get_users.req.real";
import { GithubLabelDefaultColor } from "@/entities/githubLabel.interface";
import { filtersToSearchParams, parseFilters } from "@/lib/taskFfiltersUrl";
import { toURLSearchParams } from "@/lib/toUrlSearchParams";
import styles from "./page.module.css";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ListAllTasksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await toURLSearchParams(searchParams);
  const filters = parseFilters(sp);

  const [tasks, usersData] = await Promise.all([
    getTasksServerReq(filtersToSearchParams(filters)),
    getUsersServerReq().catch((e) => {
      // Справочник пользователей не критичен для отображения доски —
      // если упал, отдаём пустой список, форма добавления подтянет через useQuery.
      console.error("[ListAllTasksPage] users fetch failed", e);
      return { users: [] };
    }),
  ]);

  if (!tasks) return null;

  const mappedTasks = tasks.items.map(fromTaskOut);
  const mappedAllTags = tasks.all_tags?.map(fromGithubLabelOut);

  const tagsStorage: FilterOptionData[] | undefined = mappedAllTags?.map((tag) => ({
    value: tag.id?.toString() ?? tag.name,
    label: tag.name,
    dotHexColor: GithubLabelDefaultColor,
  }));

  const assigneesStorage: FilterOptionData[] | undefined =
    tasks.all_executors?.map((e) => ({
      value: e.user_id.toString(),
      label: e.name,
    }));

  return (
    <div style={{ background: "#f5f6f8", minHeight: "100vh", padding: 32 }}>
      <Suspense fallback={null}>
        <div className={styles.filters}>
          <PriorityTaskFilter />
          <StatusTaskFilter />
          {tagsStorage && <TagsFilter storage={tagsStorage} />}
          {assigneesStorage && <AssigneesFilter storage={assigneesStorage} />}
          <DeadlineFilter />
        </div>
      </Suspense>

      <TasksInKanban
        initialTasks={mappedTasks}
        initialUsers={usersData.users}
        search={sp.toString()}
      />
    </div>
  );
}