import GithubLabelOut from "@/api/dto/github_label/get_all/GithubLabelOut";
import getBackendUrl from "@/utils/getBackendUrl";
import { cookies } from "next/headers";

export default async function getTagsFilterServerReal(): Promise<GithubLabelOut[]> {
    const cookieStore = await cookies();
        const res = await fetch(`${getBackendUrl()}/task/filters/tags`, {
            cache: "no-store",
            headers: { Accept: "application/json", Cookie: cookieStore.toString() },
        });
    // TODO: сделать такой же Error у всех !res.ok
    if (!res.ok) throw new Error(`[getTagsFilterServerReal] ${res.status}`);
    return await res.json();
}