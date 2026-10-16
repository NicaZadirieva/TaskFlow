"use client";

import MultipleFilterDropdown from "@/components/ui/task/features/MultipleFilterDropdown";
import { FilterOptionData } from "@/components/ui/task/features/MultipleFilterDropdown/MultipleFilterDropdownProps.props";
import { useTaskFilters } from "@/hooks/useTaskFilters";


export default function AssigneesFilter({ storage }: { storage: FilterOptionData[] }) {
    const { filters, setFilters } = useTaskFilters();
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