
import { Suspense } from "react";

import fromGithubLabelOut from "@/api/dto/github_label/get_all/mappers/fromGithubLabelOut";

import {
  DeadlineFilter,
  PriorityTaskFilter,
  StatusTaskFilter,
  TasksInKanban,
} from "@/components/ui/task";
import { FilterOptionData } from "@/components/ui/task/features/MultipleFilterDropdown/MultipleFilterDropdownProps.props";

import { GithubLabelDefaultColor } from "@/entities/githubLabel.interface";

import { fromTaskOut } from "@/api/dto/task/get_tasks/mapper/fromTaskOut";
import getTasksReq from "@/api/requests/task/get_tasks/req";
import AssigneesFilter from "@/components/ui/task/entities/filters/AssigneesFilter";
import TagsFilter from "@/components/ui/task/entities/filters/TagsFilter";
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

  const tasks = await getTasksReq(filtersToSearchParams(filters));
  if (!tasks) return null;

  const mappedTasks = tasks.items.map(fromTaskOut);
  const mappedAllTags = tasks.all_tags?.map(fromGithubLabelOut);

  const tagsStorage: FilterOptionData[] | undefined = mappedAllTags?.map((tag) => ({
    value: tag.id.toString(),
    label: tag.name,
    dotHexColor: GithubLabelDefaultColor,
  }));

  const assigneesStorage: FilterOptionData[] | undefined =
    tasks.all_executors?.map((e) => ({
      value: e.user_id.toString(),/////
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

      <TasksInKanban tasks={mappedTasks} />
    </div>
  );
}