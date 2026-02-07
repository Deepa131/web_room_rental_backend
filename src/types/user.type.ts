import z from "zod";

export const UserSchema = z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["renter", "owner", "admin"]).default("renter"),
    profilePicture: z.string().optional(),
});

export type UserType = z.infer<typeof UserSchema>;