import mongoose from "mongoose";
import { MONGODB_URI } from "../config";
import { RoomTypeModel } from "../models/room.type.model";

export async function connectDatabase(){
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");
        
        // Seed default room types if they don't exist
        await seedRoomTypes();
    } catch (error) {
        console.error("Database Error:", error);
        process.exit(1);
    }
}

async function seedRoomTypes() {
    try {
        const count = await RoomTypeModel.countDocuments();
        
        if (count === 0) {
            const defaultRoomTypes = [
                { typeName: "1 BHK", status: "active" },
                { typeName: "2 BHK", status: "active" },
                { typeName: "Studio", status: "active" },
                { typeName: "Single Room", status: "active" },
            ];
            
            await RoomTypeModel.insertMany(defaultRoomTypes);
            console.log("Default room types seeded successfully");
        }
    } catch (error) {
        console.error("Error seeding room types:", error);
    }
}