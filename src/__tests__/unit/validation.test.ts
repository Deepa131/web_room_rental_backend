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

	test("5. Should reject invalid role", () => {
		const result = UserSchema.safeParse({
			fullName: "Test User",
			email: "test@example.com",
			password: "password123",
			role: "superadmin",
		});

		expect(result.success).toBe(false);
	});

	test("6. Should validate email with special characters", () => {
		const result = UserSchema.safeParse({
			fullName: "Test User",
			email: "test+tag@example.co.uk",
			password: "password123",
			role: "renter",
		});

		expect(result.success).toBe(true);
	});

	test("7. Should reject missing fullName", () => {
		const result = UserSchema.safeParse({
			email: "test@example.com",
			password: "password123",
			role: "renter",
		});

		expect(result.success).toBe(false);
	});

	test("8. Should enforce minimum password length", () => {
		const validPasswords = ["password1", "MyP@ssw0rd", "123456789"];
		
		for (const pass of validPasswords) {
			const result = UserSchema.safeParse({
				fullName: "Test User",
				email: "test@example.com",
				password: pass,
				role: "renter",
			});
			
			expect(result.success).toBe(true);
		}
	});
});
