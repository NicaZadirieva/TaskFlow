import GetUsersResponse from "@/api/dto/user/get_users/GetUsersResponse";
import getBackendUrl from "@/utils/getBackendUrl";
import { cookies } from "next/headers";

export async function getUsersServerReq(): Promise<GetUsersResponse> {
    const url = `${getBackendUrl()}/user/users`;

    const cookieStore = await cookies();

    const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: {
            Accept: "application/json",
            Cookie: cookieStore.toString(),
        },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
            `[getUsersServer] ${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`,
        );
    }

    return (await res.json());
}