import "dotenv/config";
import { sendEmail } from "../services/emailService.js";

const to = process.argv[2];
if (!to) {
    console.error("Cách dùng: node scripts/emailCheck.js email-nhan@example.com");
    process.exit(1);
}

try {
    const result = await sendEmail({
        to,
        subject: "Thử gửi email từ GIN Shop",
        html: "<p>Nếu bạn đọc được dòng này thì việc gửi email đã hoạt động.</p>",
    });
    console.log(
        result.sent
            ? "Đã gửi, hãy kiểm tra hộp thư (cả mục Spam)."
            : "Chưa có BREVO_API_KEY nên không gửi thật."
    );
} catch (err) {
    console.error("Lỗi:", err.message);
}