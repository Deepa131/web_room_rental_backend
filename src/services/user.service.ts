import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../config/email";
import {
    FRONTEND_URL,
    JWT_SECRET,
    RESET_PASSWORD_EXPIRE_MINUTES,
    RESET_PASSWORD_URL,
} from "../config";

const userRepository = new UserRepository();

export class UserService {
    async createUser(data: CreateUserDTO) {
        const emailCheck = await userRepository.getUserByEmail(data.email.toLowerCase());
        if (emailCheck) {
            throw new HttpError(403, "Email already in use");
        }
        
        // Password will be hashed by the pre-save hook in the model
        const newUser = await userRepository.createUser(data);
        return newUser;
    }

    async loginUser(data: LoginUserDTO) {
        const user = await userRepository.getUserByEmail(data.email.toLowerCase());
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        // compare password
        const validPassword = await bcryptjs.compare(data.password, user.password);
        // plaintext, hashed
        if (!validPassword) {
            throw new HttpError(401, "Invalid credentials");
        }
        // generate jwt
        const payload = { 
            id: user._id,
            email: user.email,
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

    async getUserById(id: string) {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    async updateUserData(id: string, updateData: Partial<CreateUserDTO>) {
        const updatedUser = await userRepository.updateUser(id, updateData);
        if (!updatedUser) {
            throw new HttpError(404, "User not found");
        }
        return updatedUser;
    }

    async requestPasswordReset(email: string) {
        const user = await userRepository.getUserByEmail(email.toLowerCase());
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpire = new Date(
            Date.now() + RESET_PASSWORD_EXPIRE_MINUTES * 60 * 1000
        );

        await user.save({ validateBeforeSave: false });

        const baseUrl = RESET_PASSWORD_URL || `${FRONTEND_URL}/reset-password`;
        const resetLink = `${baseUrl}/${resetToken}`;

        const html = `
            <p>You requested a password reset.</p>
            <p>Click the link below to reset your password:</p>
            <p><a href="${resetLink}">Reset Password</a></p>
            <p>If you did not request this, please ignore this email.</p>
        `;

        await sendEmail(user.email, "Reset your password", html);

        return { message: "Password reset email sent" };
    }

    async resetPassword(token: string, newPassword: string) {
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const user = await userRepository.getUserByResetToken(tokenHash);
        if (!user) {
            throw new HttpError(400, "Invalid or expired token");
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        return user;
    }
}
