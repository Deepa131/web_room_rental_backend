import jwt from "jsonwebtoken";

describe("JWT Token Unit Tests", () => {
	const secret = process.env.JWT_SECRET || "test-secret";
	const payload = { userId: "123", email: "test@example.com" };

	test("1. Should generate valid JWT token", () => {
		const token = jwt.sign(payload, secret, { expiresIn: "24h" });
		expect(token).toBeDefined();
		expect(typeof token).toBe("string");
	});

	test("2. Should verify token with correct secret", () => {
		const token = jwt.sign(payload, secret, { expiresIn: "24h" });
		const decoded = jwt.verify(token, secret);
		expect(decoded).toBeDefined();
		expect((decoded as any).userId).toBe("123");
	});

	test("3. Should reject token with incorrect secret", () => {
		const token = jwt.sign(payload, secret, { expiresIn: "24h" });
		expect(() => {
			jwt.verify(token, "wrong-secret");
		}).toThrow();
	});
});
