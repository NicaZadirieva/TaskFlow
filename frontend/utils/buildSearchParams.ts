export function buildSearchParams(
    input: Record<string, string | string[] | undefined> | URLSearchParams,
): URLSearchParams {
    if (input instanceof URLSearchParams) return input;

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(input)) {
        if (value === undefined || value === "") continue;
        if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
        } else {
            params.set(key, value);
        }
    }
    return params;
}