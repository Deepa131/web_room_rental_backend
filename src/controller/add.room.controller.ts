import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import AddRoom from "../models/add.room.model";
import { RoomTypeModel } from "../models/room.type.model";

const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

export const createRoom = async (req: Request, res: Response) => {
  try {
    const {
      ownerContactNumber,
      roomTitle,
      monthlyPrice,
      location,
      roomType,
      description,
      images,
      videos,
    } = req.body;

    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const ownerId = req.user._id;
    if (!roomTitle || !monthlyPrice || !location || !roomType) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: roomTitle, monthlyPrice, location, roomType",
      });
    }

    let roomTypeId = roomType;
    if (!isValidObjectId(roomType)) {
      const foundRoomType = await RoomTypeModel.findOne({ typeName: roomType });
      if (!foundRoomType) {
        return res.status(400).json({
          success: false,
          message: `Room type "${roomType}" not found`,
        });
      }
      roomTypeId = foundRoomType._id;
    }

    const room = await AddRoom.create({
      ownerId,
      ownerContactNumber,
      roomTitle,
      monthlyPrice,
      location,
      roomType: roomTypeId,
      description,
      images,
      videos,
    });

    return res.status(201).json({ success: true, data: room });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.ownerId) filter.ownerId = req.query.ownerId;
    if (req.query.isAvailable !== undefined)
      filter.isAvailable = req.query.isAvailable === "true";
    if (req.query.approvalStatus) filter.approvalStatus = req.query.approvalStatus;

    const total = await AddRoom.countDocuments(filter);
    const rooms = await AddRoom.find(filter)
      .populate("ownerId", "fullName email")
      .populate("roomType", "typeName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: rooms.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: rooms,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

export const getRoomById = async (req: Request, res: Response) => {
  try {
    const room = await AddRoom.findById(req.params.id)
      .populate("ownerId", "fullName email")
      .populate("roomType", "typeName");

    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    return res.status(200).json({ success: true, data: room });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

export const getRoomsByOwner = async (req: Request, res: Response) => {
  try {
    const rooms = await AddRoom.find({ ownerId: req.params.ownerId })
      .populate("ownerId", "fullName email")
      .populate("roomType", "typeName");

    return res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const room = await AddRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    // Authorization check
    if (room.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this room" });
    }

    const updateFields = req.body;
    Object.assign(room, updateFields);

    await room.save();

    return res.status(200).json({ success: true, data: room });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const room = await AddRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    // Authorization check
    if (room.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this room" });
    }

    // Delete room media files
    const mediaPaths = [...(room.images || []), ...(room.videos || [])];
    mediaPaths.forEach((file) => {
      const fullPath = path.join(__dirname, "../public/uploads", file);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    });

    await AddRoom.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: "Room deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

export const uploadRoomImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Please upload an image file" });

    return res.status(200).json({
      success: true,
      data: req.file.filename,
      message: "Image uploaded successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

export const uploadRoomVideo = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Please upload a video file" });

    return res.status(200).json({
      success: true,
      data: req.file.filename,
      message: "Video uploaded successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};
