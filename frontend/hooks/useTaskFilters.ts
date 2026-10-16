"use client";
import { filtersToSearchParams, parseFilters } from "@/lib/taskFfiltersUrl";
import { DEFAULT_FILTERS, TaskFilters } from "@/lib/taskFilters";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";


export function useTaskFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const filters = useMemo<TaskFilters>(
        () => (searchParams
            ? parseFilters(new URLSearchParams(searchParams.toString()))
            : DEFAULT_FILTERS),
        [searchParams],
    );

    const setFilters = useCallback(
        (patch: Partial<TaskFilters>, opts: { replace?: boolean; keepOffset?: boolean } = {}) => {
            const next: TaskFilters = { ...filters, ...patch };
            if (!opts.keepOffset) next.offset = 0;
            const qs = filtersToSearchParams(next).toString();
            const url = qs ? `${pathname}?${qs}` : pathname;
            opts.replace
                ? router.replace(url, { scroll: false })
                : router.push(url, { scroll: false });
        },
        [filters, pathname, router],
    );

    return { filters, setFilters };
}