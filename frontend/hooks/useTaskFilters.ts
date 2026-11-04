'use client';
import { DEFAULT_FILTERS, TaskFilters } from '@/lib/taskFilters';
import { filtersToSearchParams, parseFilters } from '@/lib/taskFiltersUrl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export function useTaskFilters() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const filters = useMemo<TaskFilters>(
		() =>
			searchParams
				? parseFilters(new URLSearchParams(searchParams.toString()))
				: DEFAULT_FILTERS,
		[searchParams]
	);

	const setFilters = useCallback(
		(
			patch: Partial<TaskFilters>,
			opts: { replace?: boolean; keepOffset?: boolean } = {}
		) => {
			const next: TaskFilters = { ...filters, ...patch };

			// сброс пагинации, если меняем что-то кроме offset/limit
			const touchedFilter =
				patch.tag_ids !== undefined ||
        patch.priority !== undefined ||
        patch.status !== undefined ||
        patch.deadline !== undefined ||
        patch.sort_by !== undefined ||
        patch.sort_order !== undefined;

			if (!opts.keepOffset && (touchedFilter || patch.offset === undefined)) {
				next.offset = 0;
			}

			const qs = filtersToSearchParams(next).toString();
			const url = qs ? `${pathname}?${qs}` : pathname;
			router[opts.replace ? 'replace' : 'push'](url, { scroll: false });
		},
		[filters, pathname, router]
	);

	return { filters, setFilters };
}
