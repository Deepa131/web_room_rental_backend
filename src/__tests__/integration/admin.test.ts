import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import { UserModel } from "../../models/user.model";

const baseUser = {
	fullName: "Test User",
	email: "test@gmail.com",
	password: "password123",
	confirmPassword: "password123",
	role: "renter",
};

const adminUser = {
	fullName: "Admin User",
	email: "admin@gmail.com",
	password: "password123",
	confirmPassword: "password123",
	role: "admin",
};

const renterUser = {
	fullName: "Renter User",
	email: "renter@gmail.com",
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

const getToken = async (email: string, password: string = "password123") => {
	const res = await request(app)
		.post("/api/auth/login")
		.send({ email, password });
	return res.body.token;
};

describe("Admin Integration Tests", () => {
	let adminToken: string;
	let userId: string;

	beforeEach(async () => {
		await createUser(adminUser);
		adminToken = await getToken(adminUser.email);
	});

	test("11. Should get all users with admin token", async () => {
		const res = await request(app)
			.get("/api/admin/users")
			.set("Authorization", `Bearer ${adminToken}`);
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.data)).toBe(true);
	});

	test("12. Should block admin route without token", async () => {
		const res = await request(app).get("/api/admin/users");
		expect(res.status).toBe(401);
	});

	test("13. Should block admin route with invalid token", async () => {
		const res = await request(app)
			.get("/api/admin/users")
			.set("Authorization", "Bearer invalid_token");
		expect(res.status).toBe(401);
	});

	test("14. Should reject non-admin accessing admin route", async () => {
		await createUser(renterUser);
		const userToken = await getToken(renterUser.email);
		const res = await request(app)
			.get("/api/admin/users")
			.set("Authorization", `Bearer ${userToken}`);
		expect(res.status).toBe(403);
	});

	test("15. Should admin create a new user", async () => {
		const res = await request(app)
			.post("/api/admin/users")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ ...baseUser, email: "newadminuser@gmail.com" });
		expect(res.status).toBe(201);
		userId = res.body.data._id;
	});

	test("16. Should get user by ID", async () => {
		const userRes = await createUser({ email: "testuser@gmail.com" });
		const res = await request(app)
			.get(`/api/admin/users/${userRes.body.data._id}`)
			.set("Authorization", `Bearer ${adminToken}`);
		expect(res.status).toBe(200);
	});

	test("17. Should return 404 for non-existent user", async () => {
		const fakeId = new mongoose.Types.ObjectId();
		const res = await request(app)
			.get(`/api/admin/users/${fakeId}`)
			.set("Authorization", `Bearer ${adminToken}`);
		expect(res.status).toBe(404);
	});

	test("18. Should update user by ID", async () => {
		const userRes = await createUser({ email: "updateuser@gmail.com" });
		const res = await request(app)
			.put(`/api/admin/users/${userRes.body.data._id}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ fullName: "Updated Name" });
		expect(res.status).toBe(200);
		expect(res.body.data.fullName).toBe("Updated Name");
	});

	test("19. Should delete user", async () => {
		const userRes = await createUser({ email: "deleteuser@gmail.com" });
		const res = await request(app)
			.delete(`/api/admin/users/${userRes.body.data._id}`)
			.set("Authorization", `Bearer ${adminToken}`);
		expect(res.status).toBe(200);
	});

	test("20. Should get admin statistics", async () => {
		const res = await request(app)
			.get("/api/admin/stats")
			.set("Authorization", `Bearer ${adminToken}`);
		expect(res.status).toBe(200);
	});
});
