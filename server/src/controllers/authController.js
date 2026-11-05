import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";
import { signToken } from "../utils/signToken.js";

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

  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
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
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}
export async function getMe(req, res) {
  const { _id, name, email, role, phone } = req.user;
  res.status(200).json({ user: { id: _id, name, email, role, phone } });
}