"use client";

import GithubLabelOut from "@/api/dto/github_label/get_all/GithubLabelOut";
import getTagsFiltersClientReq from "@/api/requests/task/get_tags_filter/client/get.req";
import MultipleFilterDropdown from "@/components/ui/task/features/MultipleFilterDropdown";
import { FilterOptionData } from "@/components/ui/task/features/MultipleFilterDropdown/MultipleFilterDropdownProps.props";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { useQuery } from "@tanstack/react-query";


export default function TagsFilter({ initialData }: { initialData: GithubLabelOut[] }) {
    const { filters, setFilters } = useTaskFilters();

    const { data: tags = [] } = useQuery({
        queryKey: ["filter-tags"],
        queryFn: getTagsFiltersClientReq,
        initialData,
        staleTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        // refetchInterval отсутствует — справочник не опрашиваем
    });

    const storage: FilterOptionData[] = tags.map((e) => ({
        value: e.id.toString(),
        label: e.name,
    }));
    return (
        <MultipleFilterDropdown
            storage={storage}
            optionsGroupName="Теги"
            widthInPx={150}
            value={filters.tag_ids.map(String)}
            onChange={(vals) =>
                setFilters({
                    tag_ids: (vals ?? []).map(Number).filter(Number.isFinite),
                })
            }
        />
    );
}