import "dotenv/config";
import { getCloudinary } from "../config/cloudinary.js";

const result = await getCloudinary().api.ping();
console.log(result);