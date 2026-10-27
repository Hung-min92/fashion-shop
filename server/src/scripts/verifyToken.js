import "dotenv/config";
import jwt from "jsonwebtoken";

const token = process.argv[2];

try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token hợp lệ:", payload);
} catch (error) {
    console.log("Token bị từ chối:", error.name, "-", error.message);
}