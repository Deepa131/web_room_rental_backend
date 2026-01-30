import { Request, Response } from "express";
import { RoomTypeModel } from "../models/room.type.model";

/**
 * @desc    Create a new room type
 * @route   POST /api/roomTypes
 * @access  Private (Owner/Admin equivalent)
 */
export const createRoomType = async (req: Request, res: Response) => {
  try {
    const { typeName, status } = req.body;

    if (!typeName || typeof typeName !== "string") {
      return res.status(400).json({
        success: false,
        message: "Room type name is required",
      });
    }

    const roomType = await RoomTypeModel.create({
      typeName: typeName.trim(),
      status: status ?? "active",
    });

    return res.status(201).json({
      success: true,
      data: roomType,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create room type",
    });
  }
};

/**
 * @desc    Get all room types
 * @route   GET /api/roomTypes
 * @access  Public
 */
export const getAllRoomTypes = async (_req: Request, res: Response) => {
  try {
    const roomTypes = await RoomTypeModel.find();

    return res.status(200).json({
      success: true,
      data: roomTypes,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch room types",
    });
  }
};

/**
 * @desc    Get room type by ID
 * @route   GET /api/roomTypes/:id
 * @access  Public
 */
export const getRoomTypeById = async (req: Request, res: Response) => {
  try {
    const roomType = await RoomTypeModel.findById(req.params.id);

    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: "Room type not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: roomType,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: "Invalid room type ID",
    });
  }
};

/**
 * @desc    Update room type
 * @route   PUT /api/roomTypes/:id
 * @access  Private (Owner/Admin equivalent)
 */
export const updateRoomType = async (req: Request, res: Response) => {
  try {
    const { typeName, status } = req.body;

    const roomType = await RoomTypeModel.findByIdAndUpdate(
      req.params.id,
      {
        ...(typeName && { typeName }),
        ...(status && { status }),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: "Room type not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: roomType,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update room type",
    });
  }
};

/**
 * @desc    Delete room type
 * @route   DELETE /api/roomTypes/:id
 * @access  Private (Owner/Admin equivalent)
 */
export const deleteRoomType = async (req: Request, res: Response) => {
  try {
    const roomType = await RoomTypeModel.findById(req.params.id);

    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: "Room type not found",
      });
    }

    await roomType.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Room type deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete room type",
    });
  }
};
