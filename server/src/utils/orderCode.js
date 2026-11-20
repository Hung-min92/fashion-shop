import crypto from "crypto";

// 32 ký tự, bỏ 0/O/1/I để khách đọc và gõ không nhầm
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateOrderCode() {
    let s = "";
    for (let i = 0; i < 8; i++) s += ALPHABET[crypto.randomInt(ALPHABET.length)];
    return `GS-${s}`; // 32^8 ≈ 1,1 nghìn tỷ khả năng, không đoán được
}