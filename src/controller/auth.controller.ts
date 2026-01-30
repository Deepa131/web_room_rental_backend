import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { Request, Response } from "express";
import z from "zod";

const userService = new UserService();

export class AuthController {

  // Register new user (signup)
  async register(req: Request, res: Response) {
    try {
      const parsedData = CreateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const userData: CreateUserDTO = parsedData.data;
      const newUser = await userService.createUser(userData);

      // Remove password from response
      const { password, ...safeUser } = newUser.toObject();

      return res.status(201).json({
        success: true,
        message: "User Created",
        data: safeUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // Login user
  async login(req: Request, res: Response) {
    try {
      const parsedData = LoginUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const loginData: LoginUserDTO = parsedData.data;
      const { token, user } = await userService.loginUser(loginData);

      // Remove password from response
      const { password, ...safeUser } = user.toObject();

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: safeUser,
        token,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // Update profile picture after signup
  async updateProfilePicture(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { profilePicture } = req.body;
      if (!profilePicture) {
        return res.status(400).json({
          success: false,
          message: "Profile picture is required",
        });
      }

      const updatedUser = await userService.updateProfilePicture(
        req.user._id.toString(),
        profilePicture
      );

      return res.status(200).json({
        success: true,
        message: "Profile picture updated",
        data: updatedUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
