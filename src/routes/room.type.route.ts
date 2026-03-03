import { Router } from "express";
import {
  createRoomType,
  getAllRoomTypes,
  getRoomTypeById,
  updateRoomType,
  deleteRoomType,
} from "../controller/room.type.controller";
import { adminMiddleware, authorizedMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getAllRoomTypes);
router.post("/", authorizedMiddleware, adminMiddleware, createRoomType);
router.get("/:id", getRoomTypeById);
router.put("/:id", authorizedMiddleware, adminMiddleware, updateRoomType);
router.delete("/:id", authorizedMiddleware, adminMiddleware, deleteRoomType);

export default router;
