export async function apiGet(path) {
    const res = await fetch(path);
    const body = await res.json();
    if (!res.ok) {
        throw new Error(body.message || "Có lỗi xảy ra");
    }
    return body;
}