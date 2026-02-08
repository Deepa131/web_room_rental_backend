import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { authorizedMiddleware } from "../middleware/auth.middleware";
import { uploadImage } from "../middleware/upload.middleware";

let authController = new AuthController();
const router = Router();

router.post("/register", authController.register)
router.post("/login", authController.login)
router.post("/forgot-password", authController.forgotPassword)
router.post("/reset-password/:token", authController.resetPassword)
router.put("/profile-picture", authorizedMiddleware, uploadImage.single("profilePicture"), authController.updateProfilePicture);
router.put("/:id", authorizedMiddleware, uploadImage.single("profilePicture"), authController.updateUserProfile);

export default router;