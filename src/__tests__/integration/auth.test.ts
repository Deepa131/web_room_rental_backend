import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { sendEmail } from "../../config/email";

jest.mock("../../config/email", () => ({
	sendEmail: jest.fn().mockResolvedValue(undefined),
}));

const sendEmailMock = sendEmail as jest.Mock;

const baseUser = {
	fullName: "Test User",
	email: "test@gmail.com",
	password: "password123",
	confirmPassword: "password123",
	role: "renter",
};

const createUser = async (overrides: Partial<typeof baseUser> = {}) => {
	return request(app).post("/api/auth/register").send({
		...baseUser,
		...overrides,
	});
};

const loginUser = async (email: string, password: string) => {
	return request(app).post("/api/auth/login").send({ email, password });
};

describe("Auth Integration Tests", () => {
	beforeEach(() => {
		sendEmailMock.mockClear();
	});

	test("1. Should register a new user", async () => {
		const res = await createUser();
		expect(res.status).toBe(201);
		expect(res.body.data.email).toBe(baseUser.email);
		expect(res.body.data.password).toBeUndefined();
	});

	test("2. Should show error when email already exists", async () => {
		await createUser();
		const res = await createUser();
		expect(res.status).toBe(400);
	});

	test("3. Should reject invalid email format", async () => {
		const res = await createUser({ email: "invalid-email" });
		expect(res.status).toBe(400);
	});

	test("4. Should reject when passwords don't match", async () => {
		const res = await createUser({ confirmPassword: "different" });
		expect(res.status).toBe(400);
	});

	test("5. Should reject registration with missing fields", async () => {
		const res = await request(app)
			.post("/api/auth/register")
			.send({ email: "test@gmail.com" });
		expect(res.status).toBe(400);
	});

	test("6. Should login with valid credentials", async () => {
		await createUser({ email: "login@gmail.com" });
		const res = await loginUser("login@gmail.com", baseUser.password);
		expect(res.status).toBe(200);
		expect(res.body.token).toBeTruthy();
	});

	test("7. Should reject login with wrong password", async () => {
		await createUser({ email: "wrongpass@gmail.com" });
		const res = await loginUser("wrongpass@gmail.com", "wrongpass");
		expect(res.status).toBe(401);
	});

	test("8. Should reject login with non-existent email", async () => {
		const res = await loginUser("nonexistent@gmail.com", "password123");
		expect(res.status).toBe(401);
	});

	test("9. Should allow forgot password request", async () => {
		await createUser({ email: "forgot@gmail.com" });
		const res = await request(app)
			.post("/api/auth/forgot-password")
			.send({ email: "forgot@gmail.com" });
		expect(res.status).toBe(200);
		expect(sendEmailMock).toHaveBeenCalled();
	});

	test("10. Should reject forgot password with invalid email", async () => {
		const res = await request(app)
			.post("/api/auth/forgot-password")
			.send({ email: "nonexistent@gmail.com" });
		expect(res.status).toBe(404);
	});
});
