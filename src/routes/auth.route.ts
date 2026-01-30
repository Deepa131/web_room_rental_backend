import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { authorizedMiddleware } from "../middleware/auth.middleware";

let authController = new AuthController();
const router = Router();

router.post("/register", authController.register)
router.post("/login", authController.login)
router.put("/profile-picture",authorizedMiddleware, authController.updateProfilePicture);

export default router;