import { Router } from "express";
import {
  createRoomType,
  getAllRoomTypes,
  getRoomTypeById,
  updateRoomType,
  deleteRoomType,
} from "../controller/room.type.controller";
import { authorizedMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getAllRoomTypes);
router.post("/", authorizedMiddleware, createRoomType);
router.get("/:id", getRoomTypeById);
router.put("/:id", authorizedMiddleware, updateRoomType);
router.delete("/:id", authorizedMiddleware, deleteRoomType);

export default router;
