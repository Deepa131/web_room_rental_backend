import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAddRoom extends Document {
  ownerId: mongoose.Types.ObjectId;
  ownerContactNumber: string;
  roomTitle: string;
  monthlyPrice: number;
  location: string;
  roomType: mongoose.Types.ObjectId;
  description?: string;
  images: string[];
  videos: string[];
  isAvailable: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const addRoomSchema = new Schema<IAddRoom>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
    },
    ownerContactNumber: {
      type: String,
      required: [true, "Owner contact number is required"],
      trim: true,
    },
    roomTitle: {
      type: String,
      required: [true, "Room title is required"],
      trim: true,
    },
    monthlyPrice: {
      type: Number,
      required: [true, "Monthly price is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    roomType: {
      type: Schema.Types.ObjectId,
      ref: "RoomType",
      required: [true, "Room type is required"],
    },
    description: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    videos: [
      {
        type: String,
        trim: true,
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const AddRoom: Model<IAddRoom> =
  mongoose.models.AddRoom || mongoose.model<IAddRoom>("AddRoom", addRoomSchema);

export default AddRoom;
