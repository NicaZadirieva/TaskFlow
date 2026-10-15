export default async function parseErrorMessage(res: Response, defaultPhrase: string = "Error"): Promise<string> {
    const errorData = await res.json().catch(() => ({}));
    return errorData.detail || defaultPhrase;
}

