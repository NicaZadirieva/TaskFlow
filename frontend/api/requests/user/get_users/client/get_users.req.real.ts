
import GetUsersResponse from "@/api/dto/user/get_users/GetUsersResponse";
import getBackendUrl from "@/utils/getBackendUrl";

export async function getUsersClient(): Promise<GetUsersResponse> {
    const res = await fetch(`${getBackendUrl()}/user/users`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
    });

    if (!res.ok) {
        throw new Error(`[getUsersClient] HTTP ${res.status}`);
    }

    return (await res.json());
}