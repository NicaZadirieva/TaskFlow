import GithubLabel from "@/api/types/github-label.types";
import RequestError from "@/api/utils/error";
import getBackendUrl from "@/utils/getBackendUrl";
import parseErrorMessage from "@/utils/parseErrorMessage";
import { cookies } from "next/headers";

interface GithubLabelListOut {
    items: GithubLabel[];
}

function buildCookieHeader(
    cookieStore: Awaited<ReturnType<typeof cookies>>,
): string {
    return cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");
}


export default async function getAllGithubLabelsReq(): Promise<GithubLabel[]> {
    const cookieStore = await cookies();
    const cookieHeader = buildCookieHeader(cookieStore);

    const res = await fetch(`${getBackendUrl()}/tag/all`, {
        method: "GET",
        headers: { Cookie: cookieHeader },
        // иначе Next закеширует и будет отдавать чужие данные
        cache: "no-store",
    });

    if (!res.ok) {
        const message = await parseErrorMessage(res);
        throw new RequestError(message, res.status);
    }

    const data: GithubLabelListOut = await res.json();
    return data.items ?? [];
}