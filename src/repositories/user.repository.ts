import { UserModel, type IUser } from "../models/user.model";

export interface IUserRepository {
    getUserByEmail(email: string): Promise<IUser | null>;
    createUser(userData: Partial<IUser>): Promise<IUser>;
    getUserById(id: string): Promise<IUser | null>;
    getAllUsers(): Promise<IUser[]>;
    getUsersPaginated(page: number, limit: number): Promise<{ users: IUser[]; total: number }>; 
    getUserByResetToken(tokenHash: string): Promise<IUser | null>;
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
    async getUsersPaginated(page: number, limit: number): Promise<{ users: IUser[]; total: number }> {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            UserModel.find().skip(skip).limit(limit),
            UserModel.countDocuments(),
        ]);
        return { users, total };
    }
    async getUserByResetToken(tokenHash: string): Promise<IUser | null> {
        const user = await UserModel.findOne({
            resetPasswordToken: tokenHash,
            resetPasswordExpire: { $gt: new Date() },
        }).select("+password");
        return user;
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