import z from "zod";

export const UserSchema = z.object({
    fullName: z.string().min(1).trim(),
    email: z.string().email().trim(),
    password: z.string().min(6).trim(),
    role: z.enum(["renter", "owner", "admin"]).default("renter"),
    profilePicture: z.string().nullish().default("default-profile.png"),
});

export type UserType = z.infer<typeof UserSchema>;