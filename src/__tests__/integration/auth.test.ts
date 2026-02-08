import request from "supertest";
import mongoose from "mongoose";
import crypto from "crypto";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { sendEmail } from "../../config/email";

jest.mock("../../config/email", () => ({
	sendEmail: jest.fn().mockResolvedValue(undefined),
}));

const sendEmailMock = sendEmail as jest.Mock;

const baseUser = {
	fullName: "Deepa Paudel",
	email: "deepa@gmail.com",
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

const createAdminAndLogin = async () => {
	await createUser({
		email: "admin@gmail.com",
		role: "admin",
	});

	const loginRes = await loginUser("admin@gmail.com", baseUser.password);
	return loginRes.body.token as string;
};

const extractResetToken = () => {
	const html = sendEmailMock.mock.calls[0]?.[2] as string;
	const match = html?.match(/reset-password\/([a-f0-9]+)/i);
	return match ? match[1] : "";
};

describe("Auth and admin integration", () => {
	beforeEach(() => {
		sendEmailMock.mockClear();
	});

	test("registers a user", async () => {
		const res = await createUser();
		expect(res.status).toBe(201);
		expect(res.body.data.email).toBe(baseUser.email);
		expect(res.body.data.password).toBeUndefined();
	});

	test("rejects invalid email on register", async () => {
		const res = await createUser({ email: "bad-email" });
		expect(res.status).toBe(400);
	});

	test("logs in a user", async () => {
		await createUser();
		const res = await loginUser(baseUser.email, baseUser.password);
		expect(res.status).toBe(200);
		expect(res.body.token).toBeTruthy();
	});

	test("rejects login with wrong password", async () => {
		await createUser();
		const res = await loginUser(baseUser.email, "wrongpass");
		expect(res.status).toBe(401);
	});

	test("blocks admin routes without token", async () => {
		const res = await request(app).get("/api/admin/users");
		expect(res.status).toBe(401);
	});

	test("admin can create user", async () => {
		const token = await createAdminAndLogin();
		const res = await request(app)
			.post("/api/admin/users")
			.set("Authorization", `Bearer ${token}`)
			.send({
				...baseUser,
				email: "newuser@gmail.com",
			});

		expect(res.status).toBe(201);
		expect(res.body.data.email).toBe("newuser@gmail.com");
	});

	test("admin get users returns pagination meta", async () => {
		const token = await createAdminAndLogin();

		await createUser({ email: "a@gmail.com" });
		await createUser({ email: "b@gmail.com" });

		const res = await request(app)
			.get("/api/admin/users")
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body.meta).toBeTruthy();
		expect(res.body.meta.page).toBe(1);
	});

	test("admin pagination limit works", async () => {
		const token = await createAdminAndLogin();

		await createUser({ email: "u1@gmail.com" });
		await createUser({ email: "u2@gmail.com" });
		await createUser({ email: "u3@gmail.com" });

		const res = await request(app)
			.get("/api/admin/users?page=1&limit=2")
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body.data.length).toBe(2);
	});

	test("admin pagination page works", async () => {
		const token = await createAdminAndLogin();

		await createUser({ email: "p1@gmail.com" });
		await createUser({ email: "p2@gmail.com" });
		await createUser({ email: "p3@gmail.com" });

		const res = await request(app)
			.get("/api/admin/users?page=2&limit=2")
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body.data.length).toBe(2);
	});

	test("admin pagination rejects bad page", async () => {
		const token = await createAdminAndLogin();

		const res = await request(app)
			.get("/api/admin/users?page=0&limit=10")
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(400);
	});

	test("admin pagination rejects bad limit", async () => {
		const token = await createAdminAndLogin();

		const res = await request(app)
			.get("/api/admin/users?page=1&limit=0")
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(400);
	});

	test("admin can get user by id", async () => {
		const token = await createAdminAndLogin();

		const created = await createUser({ email: "getme@gmail.com" });
		const userId = created.body.data._id;

		const res = await request(app)
			.get(`/api/admin/users/${userId}`)
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body.data._id).toBe(userId);
	});

	test("admin get user by id returns 404", async () => {
		const token = await createAdminAndLogin();
		const missingId = new mongoose.Types.ObjectId().toString();

		const res = await request(app)
			.get(`/api/admin/users/${missingId}`)
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(404);
	});

	test("admin can update user", async () => {
		const token = await createAdminAndLogin();
		const created = await createUser({ email: "update@gmail.com" });
		const userId = created.body.data._id;

		const res = await request(app)
			.put(`/api/admin/users/${userId}`)
			.set("Authorization", `Bearer ${token}`)
			.send({ fullName: "Updated Name" });

		expect(res.status).toBe(200);
		expect(res.body.data.fullName).toBe("Updated Name");
	});

	test("admin can delete user", async () => {
		const token = await createAdminAndLogin();
		const created = await createUser({ email: "delete@gmail.com" });
		const userId = created.body.data._id;

		const res = await request(app)
			.delete(`/api/admin/users/${userId}`)
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(200);
	});

	test("user cannot update someone else", async () => {
		await createUser({ email: "user1@gmail.com" });
		await createUser({ email: "user2@gmail.com" });

		const loginRes = await loginUser("user1@gmail.com", baseUser.password);
		const token = loginRes.body.token;

		const user2 = await UserModel.findOne({ email: "user2@gmail.com" });

		const res = await request(app)
			.put(`/api/auth/${user2?._id}`)
			.set("Authorization", `Bearer ${token}`)
			.send({ fullName: "Hacker" });

		expect(res.status).toBe(403);
	});

	test("user can update own profile", async () => {
		await createUser({ email: "self@gmail.com" });

		const loginRes = await loginUser("self@gmail.com", baseUser.password);
		const token = loginRes.body.token;
		const user = await UserModel.findOne({ email: "self@gmail.com" });

		const res = await request(app)
			.put(`/api/auth/${user?._id}`)
			.set("Authorization", `Bearer ${token}`)
			.send({ fullName: "Self Updated" });

		expect(res.status).toBe(200);
		expect(res.body.data.fullName).toBe("Self Updated");
	});

	test("profile update requires auth", async () => {
		const res = await request(app).put("/api/auth/123");
		expect(res.status).toBe(401);
	});

	test("forgot password sends email", async () => {
		await createUser();

		const res = await request(app)
			.post("/api/auth/forgot-password")
			.send({ email: baseUser.email });

		expect(res.status).toBe(200);
		expect(sendEmailMock).toHaveBeenCalledTimes(1);
	});

	test("forgot password rejects unknown user", async () => {
		const res = await request(app)
			.post("/api/auth/forgot-password")
			.send({ email: "missing@gmail.com" });

		expect(res.status).toBe(404);
	});

	test("forgot password validates email", async () => {
		const res = await request(app)
			.post("/api/auth/forgot-password")
			.send({ email: "not-an-email" });

		expect(res.status).toBe(400);
	});

	test("reset password rejects bad token", async () => {
		const res = await request(app)
			.post("/api/auth/reset-password/badtoken")
			.send({ password: "newpass123", confirmPassword: "newpass123" });

		expect(res.status).toBe(400);
	});

	test("reset password succeeds with valid token", async () => {
		await createUser();

		await request(app)
			.post("/api/auth/forgot-password")
			.send({ email: baseUser.email });

		const token = extractResetToken();

		const resetRes = await request(app)
			.post(`/api/auth/reset-password/${token}`)
			.send({ password: "newpass123", confirmPassword: "newpass123" });

		expect(resetRes.status).toBe(200);

		const loginRes = await loginUser(baseUser.email, "newpass123");
		expect(loginRes.status).toBe(200);
	});

	test("reset token can be used only once", async () => {
		await createUser();

		await request(app)
			.post("/api/auth/forgot-password")
			.send({ email: baseUser.email });

		const token = extractResetToken();

		const first = await request(app)
			.post(`/api/auth/reset-password/${token}`)
			.send({ password: "newpass123", confirmPassword: "newpass123" });

		expect(first.status).toBe(200);

		const second = await request(app)
			.post(`/api/auth/reset-password/${token}`)
			.send({ password: "anotherpass123", confirmPassword: "anotherpass123" });

		expect(second.status).toBe(400);
	});

	test("reset password rejects expired token", async () => {
		await createUser();
		const user = await UserModel.findOne({ email: baseUser.email }).select(
			"+password"
		);

		if (!user) throw new Error("User missing in test");

		user.resetPasswordToken = crypto
			.createHash("sha256")
			.update("expiredtoken")
			.digest("hex");
		user.resetPasswordExpire = new Date(Date.now() - 1000);
		await user.save({ validateBeforeSave: false });

		const res = await request(app)
			.post("/api/auth/reset-password/expiredtoken")
			.send({ password: "newpass123", confirmPassword: "newpass123" });

		expect(res.status).toBe(400);
	});
});
