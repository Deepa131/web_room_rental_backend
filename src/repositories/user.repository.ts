import { UserModel, type IUser } from "../models/user.model";

export interface IUserRepository {
    getUserByEmail(email: string): Promise<IUser | null>;
    createUser(userData: Partial<IUser>): Promise<IUser>;
    getUserById(id: string): Promise<IUser | null>;
    getAllUsers(): Promise<IUser[]>;
    updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
    deleteUser(id: string): Promise<IUser | null>;
}
export class UserRepository implements IUserRepository {
    async createUser(userData: Partial<IUser>): Promise<IUser> {
        const user = new UserModel(userData); 
        return await user.save();
    }
    async getUserByEmail(email: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ "email": email }).select("+password")
        return user;
    }
    async getUserById(id: string): Promise<IUser | null> {
        const user = await UserModel.findById(id);
        return user;
    }
    async getAllUsers(): Promise<IUser[]> {
        const users = await UserModel.find();
        return users;
    }
    async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        const updatedUser = await UserModel.findByIdAndUpdate(
            id, updateData, { new: true } 
        );
        return updatedUser;
    }
    async deleteUser(id: string): Promise<IUser | null> {
        const deletedUser = await UserModel.findByIdAndDelete(id);
        return deletedUser;
    }
}