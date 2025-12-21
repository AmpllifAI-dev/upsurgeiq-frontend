import { Router } from "express";
import multer from "multer";
import { storagePut } from "./storage";
import { randomBytes } from "crypto";

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.post("/api/upload", upload.array("files", 5), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadPromises = req.files.map(async (file) => {
      const randomSuffix = randomBytes(8).toString("hex");
      const fileKey = `issue-attachments/${Date.now()}-${randomSuffix}-${file.originalname}`;
      
      const { url } = await storagePut(
        fileKey,
        file.buffer,
        file.mimetype
      );
      
      return url;
    });

    const urls = await Promise.all(uploadPromises);
    res.json({ urls });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload files" });
  }
});

export default router;
