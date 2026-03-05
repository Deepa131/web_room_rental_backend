import { UserService } from "../services/user.service";
import {
  CreateUserDTO,
  ForgotPasswordDTO,
  LoginUserDTO,
  ResetPasswordDTO,
} from "../dtos/user.dto";
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

  async updateProfilePicture(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile picture is required",
      });
    }

    // Construct the URL path for the uploaded file
    // Files are served via /public, so include that in the path
    let filePath = req.file.path
      .replace(/\\/g, '/') // Convert Windows backslashes to forward slashes
      .replace('public/', '/public/'); // Add /public/ to the path

    const updatedUser = await userService.updateProfilePicture(
      req.user._id.toString(),
      filePath
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

  // Update user profile by ID (user can update their own profile)
  async updateUserProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { id } = req.params;

      // Check if user is updating their own profile
      if (req.user._id.toString() !== id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You can only update your own profile",
        });
      }

      const updateData = req.body;

      // Add profile picture if file is uploaded
      if (req.file) {
        // Construct the URL path for the uploaded file
        // Files are served via /public, so include that in the path
        let filePath = req.file.path
          .replace(/\\/g, '/') // Convert Windows backslashes to forward slashes
          .replace('public/', '/public/'); // Add /public/ to the path
        
        updateData.profilePicture = filePath;
      } else if (updateData.profilePicture === "null") {
        // Remove profile picture if "null" is sent
        updateData.profilePicture = "default-profile.png";
      }

      const updatedUser = await userService.updateUserData(id, updateData);

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Remove password from response
      const { password, ...safeUser } = updatedUser.toObject();

      return res.status(200).json({
        success: true,
        message: "User profile updated successfully",
        data: safeUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const parsedData = ForgotPasswordDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const { email } = parsedData.data;
      const result = await userService.requestPasswordReset(email);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token } = req.params;
      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Reset token is required",
        });
      }

      const parsedData = ResetPasswordDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const { password } = parsedData.data;
      await userService.resetPassword(token, password);

      return res.status(200).json({
        success: true,
        message: "Password reset successful",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
