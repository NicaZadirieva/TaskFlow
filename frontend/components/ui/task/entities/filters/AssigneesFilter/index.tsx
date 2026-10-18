"use client";

import { ExecutorShortOut } from "@/api/dto/task/get_tasks/ExecutorShortOut";
import getAssigneeFiltersClientReq from "@/api/requests/task/get_assignee_filters/client/get.req";
import MultipleFilterDropdown from "@/components/ui/task/features/MultipleFilterDropdown";
import { FilterOptionData } from "@/components/ui/task/features/MultipleFilterDropdown/MultipleFilterDropdownProps.props";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { useQuery } from "@tanstack/react-query";


export default function AssigneesFilter({ initialData }: { initialData: ExecutorShortOut[] }) {
    const { filters, setFilters } = useTaskFilters();

    const { data: assignees = [] } = useQuery({
        queryKey: ["filter-assignees"],
        queryFn: getAssigneeFiltersClientReq,
        initialData,
        staleTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        // refetchInterval отсутствует — справочник не опрашиваем
    });

    const storage: FilterOptionData[] = assignees.map((e) => ({
        value: e.user_id.toString(),
        label: e.name ?? e.login,
    }));
    return (
        <MultipleFilterDropdown
            storage={storage}
            optionsGroupName="Исполнители"
            widthInPx={200}
            showSearch
            value={filters.user_ids.map(String)}
            onChange={(vals) =>
                setFilters({
                    user_ids: (vals ?? []).map(Number).filter(Number.isFinite),
                })
            }
        />
    );
}