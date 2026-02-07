import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserType } from "../types/user.type";

export interface IUser extends UserType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  getSignedJwtToken(): string;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    fullName: { type: String, trim: true },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["renter", "owner", "admin"],
      default: "renter",
      required: true,
    },
    profilePicture: {
      type: String,
      default: "default-profile.png",
    },
  },
  { timestamps: true }
);

// Encrypt password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function (): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");

  const expiresIn = process.env.JWT_EXPIRE || "30d";

  return jwt.sign({ id: this._id.toString() }, secret, { expiresIn } as jwt.SignOptions);
};

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the model
export const UserModel: Model<IUser> = mongoose.model<IUser>(
  "User",
  UserSchema
);
