const TOKEN_KEY = "token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
const API_BASE = import.meta.env.VITE_API_URL || "";

export async function api(path, { method = "GET", body } = {}) {
    const headers = {};
    const isForm = body instanceof FormData;
    if (body && !isForm) headers["Content-Type"] = "application/json";
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let res;
    try {
        res = await fetch(`${API_BASE}${path}`, {
            method,
            headers,
            body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
        });
    } catch {
        throw new Error("Không thể kết nối đến máy chủ Backend (Port 5000). Vui lòng kiểm tra xem server backend đã chạy chưa.");
    }

    const text = await res.text();
    let data = {};
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        // Non-JSON response
    }

    if (!res.ok) {
        if (res.status >= 500 && !data.message) {
            throw new Error("Không thể kết nối đến máy chủ Backend (Port 5000). Vui lòng bật backend bằng lệnh: cd server; npm run dev");
        }
        throw new Error(data.message || `Lỗi máy chủ (${res.status})`);
    }
    return data;
}

export const apiGet = (path) => api(path);