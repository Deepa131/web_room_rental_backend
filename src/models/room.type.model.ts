import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRoomType extends Document {
  _id: mongoose.Types.ObjectId;
  typeName: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const RoomTypeSchema: Schema<IRoomType> = new Schema(
  {
    typeName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
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

export const RoomTypeModel: Model<IRoomType> =
  mongoose.model<IRoomType>("RoomType", RoomTypeSchema);
