import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const maxImageSize = 5 * 1024 * 1024; // 5MB
const maxVideoSize = 50 * 1024 * 1024; // 50MB

// Ensure directory exists
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    let uploadPath = "";

    if (file.fieldname === "profilePicture") {
      uploadPath = path.join("public", "profile_pictures");
    } else if (file.fieldname === "images") {
      uploadPath = path.join("public", "room_images");
    } else if (file.fieldname === "videos") {
      uploadPath = path.join("public", "room_videos");
    } else {
      return cb(new Error("Invalid field name for upload"), "");
    }

    ensureDir(uploadPath);
    cb(null, uploadPath);
  },

  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname);
    const prefix =
      file.fieldname === "profilePicture"
        ? "pro-pic"
        : file.fieldname === "images"
        ? "room-img"
        : "room-vid";

    cb(null, `${prefix}-${Date.now()}${ext}`);
  },
});

// Multer file filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const imageTypes = /\.(jpg|jpeg|png)$/i;
  const videoTypes = /\.(mp4|mov|avi)$/i;

  if (file.fieldname === "profilePicture" || file.fieldname === "images") {
    if (!imageTypes.test(file.originalname)) {
      return cb(new Error("Only image files are allowed"));
    }
  }

  if (file.fieldname === "videos") {
    if (!videoTypes.test(file.originalname)) {
      return cb(new Error("Only video files are allowed"));
    }
  }

  cb(null, true);
};

// Multer upload instances
export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxImageSize },
});

export const uploadVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxVideoSize },
});
