import path from "path";
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDatabase } from "./database/mongodb";

// Route imports
import authRouter from "./routes/auth.route";
import roomTypeRoutes from "./routes/room.type.route";
import addRoomRoutes from "./routes/add.room.route";

dotenv.config({ path: "./config/config.env" });

const app = express();

// Connect DB
connectDatabase();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------- CUSTOM SANITIZATION ---------------- */

app.use((req: Request, res: Response, next: NextFunction) => {
  const skipFields = [
    "email",
    "password",
    "role",
    "mediaUrl",
    "profilePicture",
  ];

  const sanitize = (obj: any) => {
    if (obj && typeof obj === "object") {
      for (const key in obj) {
        if (skipFields.includes(key)) continue;

        if (typeof obj[key] === "string") {
          obj[key] = obj[key].replace(/\$/g, "");
          if (!obj[key].includes("@") && !obj[key].startsWith("http")) {
            obj[key] = obj[key]
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");
          }
        } else if (typeof obj[key] === "object") {
          sanitize(obj[key]);
        }
      }
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.params) req.params = sanitize(req.params);

  next();
});

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : [];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, "public")));

// Users
app.use("/api/users", authRouter);

// Rooms
app.use("/api/rooms", addRoomRoutes);

// Room Types
app.use("/api/roomTypes", roomTypeRoutes);

/* ---------------- SERVER ---------------- */

const PORT = process.env.PORT ? Number(process.env.PORT) : 5050;

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});
