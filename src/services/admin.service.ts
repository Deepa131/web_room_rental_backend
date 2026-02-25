import { CreateUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";

const userRepository = new UserRepository();

export class AdminService {
  // Create new user
  async createUser(data: CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email.toLowerCase());
    if (emailCheck) {
      throw new HttpError(403, "Email already in use");
    }

    // Password will be hashed by the pre-save hook in the model
    const newUser = await userRepository.createUser(data);
    return newUser;
  }

  // Get all users
  async getAllUsers(page: number, limit: number) {
    const { users, total } = await userRepository.getUsersPaginated(page, limit);
    const totalPages = Math.ceil(total / limit) || 1;
    return { users, total, totalPages, page, limit };
  }

  // Get single user by ID 
  async getUserById(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return user;
  }

  // Update user data 
  async updateUser(id: string, updateData: Partial<CreateUserDTO>) {
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
