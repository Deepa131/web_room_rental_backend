import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import { IUser } from "../models/user.model";
import { JWT_SECRET } from "../config/index";
import { HttpError } from "../errors/http-error";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const userRepository = new UserRepository();

export const authorizedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError(401, "Unauthorized: Header malformed");
    }

    const token = authHeader.split(" ")[1];
    if (!token) throw new HttpError(401, "Unauthorized: Token missing");

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    if (!decoded || !decoded.id) {
      throw new HttpError(401, "Unauthorized: Token invalid");
    }

    // Fetch user from DB
    const user = await userRepository.getUserById(decoded.id);
    if (!user) throw new HttpError(401, "Unauthorized: User not found");

    req.user = user; // attach user to request

    next();
  } catch (error: any) {
    return res.status(error.statusCode || 401).json({
      success: false,
      message: error.message || "Unauthorized",
    });
  }
};

export const authorizeRoles = (...roles: ("renter" | "owner" | "admin")[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new HttpError(401, "Unauthorized: User missing");

      if (!roles.includes(req.user.role as "renter" | "owner" | "admin")) {
        throw new HttpError(
          403,
          `Forbidden: Role '${req.user.role}' not authorized`
        );
      }

      next();
    } catch (error: any) {
      return res.status(error.statusCode || 403).json({
        success: false,
        message: error.message || "Forbidden",
      });
    }
  };
};

// Admin middleware - checks if user is admin (role = "admin")
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized: User missing");

    if (req.user.role !== "admin") {
      throw new HttpError(
        403,
        `Forbidden: Only admins can access this resource`
      );
    }

    next();
  } catch (error: any) {
    return res.status(error.statusCode || 403).json({
      success: false,
      message: error.message || "Forbidden",
    });
  }
};