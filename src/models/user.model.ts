import mongoose, { Document, Schema } from "mongoose";
import type { UserType } from "../types/user.type";

const UserSchema: Schema = new Schema<UserType>(
    {
        fullName: { type: String },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ['renter', 'owner'],
            default: 'renter',
        }
    },
    {
        timestamps: true,
    }
);

export interface IUser extends UserType, Document { 
    _id: mongoose.Types.ObjectId; 
    createdAt: Date;
    updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>('User', UserSchema);
