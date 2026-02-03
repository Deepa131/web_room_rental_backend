import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import  bcryptjs from "bcryptjs"
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

let userRepository = new UserRepository();

export class UserService {
    async createUser(data: CreateUserDTO){
        const emailCheck = await userRepository.getUserByEmail(data.email);
        if(emailCheck){
            throw new HttpError(403, "Email already in use");
        }
        
        // Password will be hashed by the pre-save hook in the model
        const newUser = await userRepository.createUser(data);
        return newUser;
    }

    async loginUser(data: LoginUserDTO){
        const user =  await userRepository.getUserByEmail(data.email);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        // compare password
        const validPassword = await bcryptjs.compare(data.password, user.password);
        // plaintext, hashed
        if(!validPassword){
            throw new HttpError(401, "Invalid credentials");
        }
        // generate jwt
        const payload = { 
            id: user._id,
            email: user.email,
            // role: user.role
        }
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' }); 
        return { token, user }
    }

    async updateProfilePicture(userId: string, profilePicture: string) {
        const updatedUser = await userRepository.updateUser(userId, { profilePicture });
        if (!updatedUser) {
            throw new HttpError(404, "User not found");
        }
        const { password, ...safeUser } = updatedUser.toObject();
        return safeUser;
    }

    // Get all users
    async getAllUsers() {
        const users = await userRepository.getAllUsers();
        return users;
    }

    // Get user by ID
    async getUserById(id: string) {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    // Update user data
    async updateUserData(id: string, updateData: Partial<CreateUserDTO>) {
        const updatedUser = await userRepository.updateUser(id, updateData);
        if (!updatedUser) {
            throw new HttpError(404, "User not found");
        }
        return updatedUser;
    }

    // Delete user
    async deleteUser(id: string) {
        const result = await userRepository.deleteUser(id);
        if (!result) {
            throw new HttpError(404, "User not found");
        }
        return result;
    }
}