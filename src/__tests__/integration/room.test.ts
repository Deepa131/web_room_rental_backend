import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import { RoomTypeModel } from "../../models/room.type.model";

const ownerUser = {
	fullName: "Owner User",
	email: "owner@gmail.com",
	password: "password123",
	confirmPassword: "password123",
	role: "owner",
};

const renterUser = {
	fullName: "Renter User",
	email: "renter@gmail.com",
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

const baseRoom = {
	ownerContactNumber: "9800000000",
	roomTitle: "Cozy Room",
	description: "A nice room to rent",
	monthlyPrice: 10000,
	location: "Kathmandu",
	roomType: "Single Room",
	bedrooms: 1,
	bathrooms: 1,
	isAvailable: true,
};

const baseRoomType = {
	typeName: "Single Room",
	description: "Room for single person",
};

const createUser = async (userData: typeof ownerUser) => {
	return request(app).post("/api/auth/register").send(userData);
};

const getToken = async (email: string, password: string = "password123") => {
	const res = await request(app)
		.post("/api/auth/login")
		.send({ email, password });
	return res.body.token;
};

describe("Room Integration Tests", () => {
	let ownerToken: string;
	let renterToken: string;
	let roomId: string;
	let roomTypeId: string;
	let adminToken: string;

	beforeEach(async () => {
		// Create room type
		await createUser(adminUser);
		adminToken = await getToken(adminUser.email);
		const typeRes = await request(app)
			.post("/api/room-types")
			.set("Authorization", `Bearer ${adminToken}`)
			.send(baseRoomType);
		roomTypeId = typeRes.body.data.id || typeRes.body.data._id;

		// Create users
		await createUser(ownerUser);
		await createUser(renterUser);
		ownerToken = await getToken(ownerUser.email);
		renterToken = await getToken(renterUser.email);

		const roomRes = await request(app)
			.post("/api/add-room")
			.set("Authorization", `Bearer ${ownerToken}`)
			.send({ ...baseRoom, roomType: roomTypeId, roomTitle: "Seed Room" });
		roomId = roomRes.body.data.id || roomRes.body.data._id;
	});

	test("21. Should create a new room", async () => {
		const res = await request(app)
			.post("/api/add-room")
			.set("Authorization", `Bearer ${ownerToken}`)
			.send({ ...baseRoom, roomType: roomTypeId });
		expect(res.status).toBe(201);
		roomId = res.body.data.id || res.body.data._id;
		expect(res.body.data.roomTitle).toBe(baseRoom.roomTitle);
	});

	test("22. Should reject room creation without token", async () => {
		const res = await request(app)
			.post("/api/add-room")
			.send(baseRoom);
		expect(res.status).toBe(401);
	});

	test("23. Should get all rooms", async () => {
		const res = await request(app).get("/api/add-room");
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBeGreaterThan(0);
	});

	test("24. Should get room by ID", async () => {
		const res = await request(app).get(`/api/add-room/${roomId}`);
		expect(res.status).toBe(200);
		expect(res.body.data.id || res.body.data._id).toBe(roomId);
		expect(res.body.data.roomTitle).toBe("Seed Room");
	});

	test("25. Should return 404 for non-existent room", async () => {
		const fakeId = new mongoose.Types.ObjectId();
		const res = await request(app).get(`/api/add-room/${fakeId}`);
		expect(res.status).toBe(404);
	});

	test("26. Should update room by owner", async () => {
		const res = await request(app)
			.put(`/api/add-room/${roomId}`)
			.set("Authorization", `Bearer ${ownerToken}`)
			.send({ monthlyPrice: 15000 });
		expect(res.status).toBe(200);
		expect(res.body.data.monthlyPrice).toBe(15000);
	});

	test("27. Should reject room update by non-owner", async () => {
		const res = await request(app)
			.put(`/api/add-room/${roomId}`)
			.set("Authorization", `Bearer ${renterToken}`)
			.send({ monthlyPrice: 20000 });
		expect(res.status).toBe(403);
	});

	test("28. Should delete room by owner", async () => {
		const roomRes = await request(app)
			.post("/api/add-room")
			.set("Authorization", `Bearer ${ownerToken}`)
			.send({ ...baseRoom, roomType: roomTypeId, roomTitle: "Room to Delete" });

		const res = await request(app)
			.delete(`/api/add-room/${roomRes.body.data.id || roomRes.body.data._id}`)
			.set("Authorization", `Bearer ${ownerToken}`);
		expect(res.status).toBe(200);
	});

	test("29. Should filter rooms by location", async () => {
		const res = await request(app).get("/api/add-room?location=Kathmandu");
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.data)).toBe(true);
	});

	test("30. Should filter available rooms only", async () => {
		const res = await request(app).get("/api/add-room?isAvailable=true");
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.data)).toBe(true);
	});
});
