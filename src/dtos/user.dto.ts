import z from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDTO = UserSchema.pick(
    {
        fullName: true,
        email: true,
        password: true,
        role: true,
        profilePicture: true,
    }
).extend( 
    {
        confirmPassword: z.string().min(6).optional(),
    }
).refine( // extra validation for confirmPassword
    (data) => !data.confirmPassword || data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }
)
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email: z.email(),
    password: z.string().min(6)
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = UserSchema.partial();
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;

export const ForgotPasswordDTO = z.object({
    email: z.email(),
});
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordDTO>;

export const ResetPasswordDTO = z
    .object({
        password: z.string().min(6),
        confirmPassword: z.string().min(6),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });
export type ResetPasswordDTO = z.infer<typeof ResetPasswordDTO>;