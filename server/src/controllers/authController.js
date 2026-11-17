import bcrypt from "bcryptjs";
import User from "../models/User.js";
import EmailToken from "../models/EmailToken.js";
import {
  registerSchema,
  loginSchema,
  tokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/authValidator.js";
import { signToken } from "../utils/signToken.js";
import { createToken, consumeToken, isOnCooldown } from "../utils/emailToken.js";
import { sendEmail } from "../services/emailService.js";
import { verifyEmailHtml, resetPasswordHtml } from "../utils/emailTemplates.js";

function clientLink(path, token) {
  const base = (process.env.CLIENT_ORIGIN || "http://localhost:5173").replace(/\/$/, "");
  return `${base}${path}?token=${token}`;
}

async function sendVerificationEmail(user) {
  const token = await createToken(user._id, "verify");
  await sendEmail({
    to: user.email,
    subject: "Xác minh email - FASHION SHOP",
    html: verifyEmailHtml({ name: user.name, link: clientLink("/verify-email", token) }),
  });
}

export async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { name, email, password, phone } = parsed.data;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "Email đã được sử dụng" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, phone });

  // Gửi email lỗi thì vẫn cho đăng ký thành công; khách có thể bấm "Gửi lại"
  try {
    await sendVerificationEmail(user);
  } catch (err) {
    console.error("Gửi email xác minh lỗi:", err.message);
  }

  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    },
  });
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+passwordHash"
  );

  const passwordOk = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!user || !user.isActive || !passwordOk) {
    return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
  }

  res.status(200).json({
    token: signToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    },
  });
}

export async function getMe(req, res) {
  // Đọc lại từ database để chắc chắn có emailVerified mới nhất
  const user = await User.findById(req.user._id).select(
    "name email role phone emailVerified"
  );
  res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      emailVerified: user.emailVerified,
    },
  });
}

export async function verifyEmail(req, res) {
  const parsed = tokenSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const record = await consumeToken(parsed.data.token, "verify");
  if (!record) {
    return res
      .status(400)
      .json({ message: "Liên kết không hợp lệ hoặc đã hết hạn" });
  }

  await User.updateOne({ _id: record.user }, { $set: { emailVerified: true } });
  res.status(200).json({ message: "Email đã được xác minh" });
}

export async function resendVerification(req, res) {
  const user = await User.findById(req.user._id);

  if (user.emailVerified) {
    return res.status(200).json({ message: "Email đã được xác minh" });
  }
  if (await isOnCooldown(user._id, "verify")) {
    return res
      .status(429)
      .json({ message: "Vui lòng đợi 1 phút trước khi gửi lại" });
  }

  try {
    await sendVerificationEmail(user);
  } catch (err) {
    console.error("Gửi lại email xác minh lỗi:", err.message);
    return res
      .status(502)
      .json({ message: "Không gửi được email, vui lòng thử lại sau" });
  }
  res.status(200).json({ message: "Đã gửi email xác minh" });
}

const FORGOT_MESSAGE =
  "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu";

export async function forgotPassword(req, res) {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const user = await User.findOne({ email: parsed.data.email.toLowerCase() });

  if (user && user.isActive && !(await isOnCooldown(user._id, "reset"))) {
    const token = await createToken(user._id, "reset");
    // Không await việc gửi để thời gian phản hồi ít lộ việc email có tồn tại
    sendEmail({
      to: user.email,
      subject: "Đặt lại mật khẩu - FASHION SHOP",
      html: resetPasswordHtml({ name: user.name, link: clientLink("/reset-password", token) }),
    }).catch((err) => console.error("Gửi email đặt lại mật khẩu lỗi:", err.message));
  }

  // Luôn trả cùng một câu dù email có tồn tại hay không
  res.status(200).json({ message: FORGOT_MESSAGE });
}

export async function resetPassword(req, res) {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const record = await consumeToken(parsed.data.token, "reset");
  if (!record) {
    return res
      .status(400)
      .json({ message: "Liên kết không hợp lệ hoặc đã hết hạn" });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  // Mở được link trong hộp thư nghĩa là sở hữu email, nên coi như đã xác minh
  await User.updateOne(
    { _id: record.user },
    { $set: { passwordHash, emailVerified: true } }
  );
  await EmailToken.deleteMany({ user: record.user }); // hủy mọi mã còn lại

  res.status(200).json({ message: "Đã đặt lại mật khẩu, hãy đăng nhập" });
}