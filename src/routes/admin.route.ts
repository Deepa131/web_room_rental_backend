import { Router } from "express";
import { AdminController } from "../controller/admin.controller";
import { authorizedMiddleware, adminMiddleware } from "../middleware/auth.middleware";
import { uploadImage } from "../middleware/upload.middleware";
import {
  adminGetAllRooms,
  adminUpdateRoomStatus,
  adminDeleteRoom,
} from "../controller/add.room.controller";

const adminController = new AdminController();
const router = Router();

// All admin routes require both authorized and admin middleware

// USER MANAGEMENT 
// POST /api/admin/users - Create new user with optional image
router.post(
  "/users",
  authorizedMiddleware,
  adminMiddleware,
  uploadImage.single("profilePicture"),
  adminController.createUser
);

// GET /api/admin/users - Get all users
router.get(
  "/users",
  authorizedMiddleware,
  adminMiddleware,
  adminController.getAllUsers
);

// GET /api/admin/users/:id - Get single user by ID
router.get(
  "/users/:id",
  authorizedMiddleware,
  adminMiddleware,
  adminController.getUserById
);

// PUT /api/admin/users/:id - Update user with optional image
router.put(
  "/users/:id",
  authorizedMiddleware,
  adminMiddleware,
  uploadImage.single("profilePicture"),
  adminController.updateUser
);

// DELETE /api/admin/users/:id - Delete user
router.delete(
  "/users/:id",
  authorizedMiddleware,
  adminMiddleware,
  adminController.deleteUser
);

// ROOM MANAGEMENT
// GET /api/admin/rooms - Get all rooms with filters (approval status, availability, search)
router.get(
  "/rooms",
  authorizedMiddleware,
  adminMiddleware,
  adminGetAllRooms
);

// PUT /api/admin/rooms/:id/status - Update room approval status (approved, rejected, archived)
router.put(
  "/rooms/:id/status",
  authorizedMiddleware,
  adminMiddleware,
  adminUpdateRoomStatus
);

// DELETE /api/admin/rooms/:id - Delete room
router.delete(
  "/rooms/:id",
  authorizedMiddleware,
  adminMiddleware,
  adminDeleteRoom
);

export default router;
