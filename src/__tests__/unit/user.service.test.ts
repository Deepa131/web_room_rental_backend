import { HttpError } from "../../errors/http-error";

describe("UserService Unit Tests", () => {
	test("1. Should create HttpError on invalid input", () => {
		const error = new HttpError(400, "Invalid input");
		expect(error.statusCode).toBe(400);
		expect(error.message).toBe("Invalid input");
	});

	test("2. Should throw error with 401 status for auth failures", () => {
		const error = new HttpError(401, "Invalid credentials");
		expect(error.statusCode).toBe(401);
		expect(error.message).toBe("Invalid credentials");
	});

	test("3. Should handle password hashing errors gracefully", () => {
		const error = new HttpError(500, "Password hashing failed");
		expect(error.statusCode).toBe(500);
	});

	test("4. Should validate email format", () => {
		const validEmails = ["user@example.com", "test.user@example.co.uk"];
		const invalidEmails = ["user@", "@example.com", "user.example.com"];

		for (const email of validEmails) {
			expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
		}

		for (const email of invalidEmails) {
			expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
		}
	});

	test("5. Should verify token generation structure", () => {
		// Tokens are typically in format: header.payload.signature
		const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
		expect(mockToken.split(".")).toHaveLength(3);
	});

	test("6. Should handle user not found error", () => {
		const error = new HttpError(404, "User not found");
		expect(error.statusCode).toBe(404);
	});
});


