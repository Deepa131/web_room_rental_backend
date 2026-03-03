import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";

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

const baseRoomType = {
	typeName: "Single Room",
	description: "Room for single person",
};

const createUser = async (userData: typeof adminUser) => {
	return request(app).post("/api/auth/register").send(userData);
};

const getToken = async (email: string, password: string = "password123") => {
	const res = await request(app)
		.post("/api/auth/login")
		.send({ email, password });
	return res.body.token;
};

describe("Room Type Integration Tests", () => {
	let adminToken: string;
	let typeId: string;

	beforeEach(async () => {
		await createUser(adminUser);
		adminToken = await getToken(adminUser.email);
		const seedRes = await request(app)
			.post("/api/room-types")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ typeName: "Seed Room Type", description: "Seed" });
		typeId = seedRes.body.data.id || seedRes.body.data._id;
	});

	test("31. Should create a new room type", async () => {
		const res = await request(app)
			.post("/api/room-types")
			.set("Authorization", `Bearer ${adminToken}`)
			.send(baseRoomType);
		expect(res.status).toBe(201);
		typeId = res.body.data.id || res.body.data._id;
		expect(res.body.data.typeName).toBe(baseRoomType.typeName);
	});

	test("32. Should get all room types", async () => {
		const res = await request(app).get("/api/room-types");
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.data)).toBe(true);
	});

	test("33. Should get room type by ID", async () => {
		const res = await request(app).get(`/api/room-types/${typeId}`);
		expect(res.status).toBe(200);
		expect(res.body.data.id || res.body.data._id).toBe(typeId);
		expect(res.body.data.typeName).toBe("Seed Room Type");
	});

	test("34. Should reject room type creation without admin", async () => {
		await createUser(renterUser);
		const userToken = await getToken(renterUser.email);
		const res = await request(app)
			.post("/api/room-types")
			.set("Authorization", `Bearer ${userToken}`)
			.send(baseRoomType);
		expect(res.status).toBe(403);
	});

	test("35. Should update room type", async () => {
		const res = await request(app)
			.put(`/api/room-types/${typeId}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ typeName: "Updated Type Name" });
		expect(res.status).toBe(200);
		expect(res.body.data.typeName).toBe("Updated Type Name");
	});

	test("36. Should return 404 for non-existent room type", async () => {
		const fakeId = new mongoose.Types.ObjectId();
		const res = await request(app).get(`/api/room-types/${fakeId}`);
		expect(res.status).toBe(404);
	});

	test("37. Should delete room type", async () => {
		const typeRes = await request(app)
			.post("/api/room-types")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ typeName: "Temp Type", description: "Temporary" });

		const res = await request(app)
			.delete(`/api/room-types/${typeRes.body.data.id || typeRes.body.data._id}`)
			.set("Authorization", `Bearer ${adminToken}`);
		expect(res.status).toBe(200);
	});

	test("38. Should reject duplicate room type name", async () => {
		await request(app)
			.post("/api/room-types")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ typeName: "Duplicate Type", description: "First" });

		const res = await request(app)
			.post("/api/room-types")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ typeName: "Duplicate Type", description: "Second" });

		expect(res.status).toBe(400);
	});
});
