import { Router } from "express";
import { uploadImage, uploadVideo } from "../middleware/upload.middleware";
import { authorizedMiddleware } from "../middleware/auth.middleware";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  getRoomsByOwner,
  updateRoom,
  deleteRoom,
  uploadRoomImage,
  uploadRoomVideo,
} from "../controller/add.room.controller";

const router = Router();

// Upload routes (protected)
router.post(
  "/upload-image",
  authorizedMiddleware,
  uploadImage.single("images"),
  uploadRoomImage
);

router.post(
  "/upload-video",
  authorizedMiddleware,
  uploadVideo.single("videos"),
  uploadRoomVideo
);

// CRUD routes
router.post("/", authorizedMiddleware, createRoom);
router.get("/", getAllRooms);
router.get("/:id", getRoomById);
router.get("/owner/:ownerId", getRoomsByOwner);
router.put("/:id", authorizedMiddleware, updateRoom);
router.delete("/:id", authorizedMiddleware, deleteRoom);

export default router;
