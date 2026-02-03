import { Router } from "express";
import { AdminController } from "../controller/admin.controller";
import { authorizedMiddleware, adminMiddleware } from "../middleware/auth.middleware";
import { uploadImage } from "../middleware/upload.middleware";

const adminController = new AdminController();
const router = Router();

// All admin routes require both authorized and admin middleware
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

export default router;
