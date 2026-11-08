import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
        if (ok) cb(null, true);
        else cb(new Error("Chỉ chấp nhận ảnh JPG, PNG hoặc WebP"));
    },
}).single("image");

export function handleUpload(req, res, next) {
    upload(req, res, (err) => {
        if (err) {
            const message =
                err.code === "LIMIT_FILE_SIZE" ? "Ảnh tối đa 5MB" : err.message;
            return res.status(400).json({ message });
        }
        next();
    });
}