"use client";

import MultipleFilterDropdown from "@/components/ui/task/features/MultipleFilterDropdown";
import { FilterOptionData } from "@/components/ui/task/features/MultipleFilterDropdown/MultipleFilterDropdownProps.props";
import { useTaskFilters } from "@/hooks/useTaskFilters";


export default function TagsFilter({ storage }: { storage: FilterOptionData[] }) {
    const { filters, setFilters } = useTaskFilters();
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