import { UserService } from "../services/user.service";
import { CreateUserDTO } from "../dtos/user.dto";
import { Request, Response } from "express";
import z from "zod";

const userService = new UserService();

export class AdminController {
  // Create new user (admin only)
  async createUser(req: Request, res: Response) {
    try {
      const parsedData = CreateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const userData: CreateUserDTO = parsedData.data;

      // Add profile picture if file is uploaded
      if (req.file) {
        const filePath = req.file.path
          .replace(/\\/g, "/")
          .replace("public/", "/");
        userData.profilePicture = filePath;
      }

      const newUser = await userService.createUser(userData);

      // Remove password from response
      const { password, ...safeUser } = newUser.toObject();

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: safeUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // Get all users (admin only)
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();

      // Remove passwords from all users
      const safeUsers = users.map((user) => {
        const { password, ...safeUser } = user.toObject();
        return safeUser;
      });

      return res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: safeUsers,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // Get single user by ID (admin only)
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await userService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Remove password from response
      const { password, ...safeUser } = user.toObject();

      return res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: safeUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // Update user by ID (admin only)
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Add profile picture if file is uploaded
      if (req.file) {
        const filePath = req.file.path
          .replace(/\\/g, "/")
          .replace("public/", "/");
        updateData.profilePicture = filePath;
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
        message: "User updated successfully",
        data: safeUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // Delete user by ID (admin only)
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const deletedUser = await userService.deleteUser(id);

      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: { _id: deletedUser._id },
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
