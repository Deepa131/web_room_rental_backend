import { UserSchema } from "../../types/user.type";

describe("UserSchema Unit Tests", () => {
	test("1. Should accept a valid user payload", () => {
		const result = UserSchema.safeParse({
			fullName: "Test User",
			email: "test@example.com",
			password: "password123",
			role: "renter",
		});

		expect(result.success).toBe(true);
	});

	test("2. Should reject invalid email format", () => {
		const result = UserSchema.safeParse({
			fullName: "Test User",
			email: "not-an-email",
			password: "password123",
			role: "owner",
		});

		expect(result.success).toBe(false);
	});

	test("3. Should reject password below minimum length", () => {
		const result = UserSchema.safeParse({
			fullName: "Test User",
			email: "test@example.com",
			password: "short",
			role: "admin",
		});

		expect(result.success).toBe(false);
	});

	test("4. Should apply defaults for role and profilePicture", () => {
		const result = UserSchema.safeParse({
			fullName: "Test User",
			email: "test@example.com",
			password: "password123",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.role).toBe("renter");
			expect(result.data.profilePicture).toBe("default-profile.png");
		}
	});
});
