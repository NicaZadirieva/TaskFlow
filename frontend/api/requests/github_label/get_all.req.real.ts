import GithubLabel from "@/api/types/github-label.types";
import RequestError from "@/api/utils/error";
import getBackendUrl from "@/utils/getBackendUrl";
import { cookies } from "next/headers";

interface GithubLabelListOut {
    items: GithubLabel[];
}

export default async function getAllGithubLabelsReq(): Promise<GithubLabel[]> {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

    const res = await fetch(`${getBackendUrl()}/tag/all`, {
        method: "GET",
        headers: {
            Cookie: cookieHeader,
        },
        cache: "no-store", // иначе Next закеширует и будет отдавать чужие данные
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new RequestError(errorData.detail || "Not authenticated", res.status);
    }

    const data: GithubLabelListOut = await res.json();
    return data.items ?? [];
}