"use client";

import { Status } from "@/entities/task.interface";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import MultipleFilterDropdown from "../../../features/MultipleFilterDropdown";
import { FilterOptionData } from "../../../features/MultipleFilterDropdown/MultipleFilterDropdownProps.props";


const STORAGE: FilterOptionData[] = [
    { label: "OPEN", value: "OPEN", dotHexColor: "blue" },
    { label: "IN_PROGRESS", value: "IN_PROGRESS", dotHexColor: "orange" },
    { label: "DONE", value: "DONE", dotHexColor: "green" },
    { label: "BACKLOG", value: "BACKLOG", dotHexColor: "yellow" },
];

export default function StatusTaskFilter() {
    const { filters, setFilters } = useTaskFilters();

    return (
        <MultipleFilterDropdown
            storage={STORAGE}
            optionsGroupName="Статус"
            widthInPx={150}
            value={filters.status}
            onChange={(vals) => setFilters({ status: (vals ?? []) as Status[] })}
        />
    );
}