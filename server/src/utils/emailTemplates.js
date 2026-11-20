import { escapeHtml } from "../services/emailService.js";

function layout(heading, bodyHtml, link, buttonText) {
    return `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#171717">
  <h2 style="margin:0 0 16px">${heading}</h2>
  ${bodyHtml}
  <p style="margin:24px 0">
    <a href="${link}" style="background:#171717;color:#fff;padding:12px 20px;text-decoration:none;display:inline-block">${buttonText}</a>
  </p>
  <p style="font-size:12px;color:#777">Nếu nút không bấm được, hãy dán đường dẫn này vào trình duyệt:<br>${link}</p>
  <p style="font-size:12px;color:#777">Nếu bạn không yêu cầu việc này, hãy bỏ qua email.</p>
</div>`;
}

export function verifyEmailHtml({ name, link }) {
    return layout(
        "Xác minh email của bạn",
        `<p>Chào ${escapeHtml(name)}, cảm ơn bạn đã đăng ký GIN SHOP. Bấm nút dưới đây để xác minh email (liên kết có hiệu lực 24 giờ).</p>`,
        link,
        "Xác minh email"
    );
}

export function resetPasswordHtml({ name, link }) {
    return layout(
        "Đặt lại mật khẩu",
        `<p>Chào ${escapeHtml(name)}, chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn (liên kết có hiệu lực 30 phút).</p>`,
        link,
        "Đặt mật khẩu mới"
    );
}