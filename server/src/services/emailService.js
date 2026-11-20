const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

// Escape dữ liệu người dùng trước khi chèn vào HTML email
export function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export async function sendEmail({ to, subject, html }) {
    const apiKey = process.env.BREVO_API_KEY;

    // Không có khóa (máy dev, test): chỉ in ra, không gửi thật
    if (!apiKey) {
        if (process.env.NODE_ENV !== "test") {
            console.log(`[email: chưa cấu hình, không gửi thật] tới ${to}: ${subject}\n${html}`);
        }
        return { sent: false };
    }

    const res = await fetch(BREVO_URL, {
        method: "POST",
        headers: {
            "api-key": apiKey,
            "content-type": "application/json",
            accept: "application/json",
        },
        body: JSON.stringify({
            sender: {
                name: process.env.MAIL_FROM_NAME || "GIN SHOP",
                email: process.env.MAIL_FROM_EMAIL,
            },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Brevo ${res.status}: ${text}`);
    }
    return { sent: true };
}