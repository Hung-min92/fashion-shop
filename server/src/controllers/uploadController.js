import { getCloudinary } from "../config/cloudinary.js";

export async function uploadProductImage(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: "Chưa chọn ảnh" });
    }

    const cloudinary = getCloudinary();

    const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                { folder: "fashion-shop/products", resource_type: "image" },
                (err, r) => (err ? reject(err) : resolve(r))
            )
            .end(req.file.buffer);
    });

    res.status(201).json({
        data: { url: result.secure_url, publicId: result.public_id },
    });
}