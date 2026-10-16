"use client";


import { Priority } from "@/entities/task.interface";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import MultipleFilterDropdown from "../../../features/MultipleFilterDropdown";
import { FilterOptionData } from "../../../features/MultipleFilterDropdown/MultipleFilterDropdownProps.props";

const STORAGE: FilterOptionData[] = [
    { label: "low", value: "low", dotHexColor: "grey" },
    { label: "medium", value: "medium", dotHexColor: "blue" },
    { label: "high", value: "high", dotHexColor: "orange" },
    { label: "critical", value: "critical", dotHexColor: "red" },
];

export default function PriorityTaskFilter() {
    const { filters, setFilters } = useTaskFilters();

    return (
        <MultipleFilterDropdown
            storage={STORAGE}
            optionsGroupName="Приоритет"
            widthInPx={170}
            value={filters.priority}
            onChange={(vals) => setFilters({ priority: (vals ?? []) as Priority[] })}
        />
    );
}