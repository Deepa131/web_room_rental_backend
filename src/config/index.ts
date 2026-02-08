import dotenv from "dotenv";

dotenv.config();

export const PORT: number =
  process.env.PORT ? parseInt(process.env.PORT, 10) : 5050;

export const MONGODB_URI: string =
  process.env.MONGODB_URI || "mongodb://localhost:27017/room_rental";

export const JWT_SECRET: string =
  process.env.JWT_SECRET || "mero_secret";

export const FRONTEND_URL: string =
  process.env.FRONTEND_URL || "http://localhost:3000";

export const RESET_PASSWORD_URL: string =
  process.env.RESET_PASSWORD_URL || "";

export const RESET_PASSWORD_EXPIRE_MINUTES: number =
  process.env.RESET_PASSWORD_EXPIRE_MINUTES
    ? parseInt(process.env.RESET_PASSWORD_EXPIRE_MINUTES, 10)
    : 60;
