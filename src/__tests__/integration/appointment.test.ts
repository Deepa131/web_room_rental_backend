import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";
import { UserModel } from "../../models/user.model";

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

const getUserId = async (email: string): Promise<string> => {
	const user = await UserModel.findOne({ email });
	return user?._id.toString() || "";
};

describe("Appointment Integration Tests", () => {
	let ownerToken: string;
	let renterToken: string;
	let roomId: string;
	let adminToken: string;
	let appointmentId: string;

	beforeEach(async () => {
		// Setup - create users and room
		await createUser(adminUser);
		adminToken = await getToken(adminUser.email);

		const typeRes = await request(app)
			.post("/api/room-types")
			.set("Authorization", `Bearer ${adminToken}`)
			.send(baseRoomType);

		await createUser(ownerUser);
		await createUser(renterUser);
		ownerToken = await getToken(ownerUser.email);
		renterToken = await getToken(renterUser.email);

		const roomRes = await request(app)
			.post("/api/add-room")
			.set("Authorization", `Bearer ${ownerToken}`)
			.send({ ...baseRoom, roomType: typeRes.body.data.id || typeRes.body.data._id });
		roomId = roomRes.body.data.id || roomRes.body.data._id;
	});

	test("39. Should book an appointment", async () => {
		const ownerId = await getUserId(ownerUser.email);
		const renterId = await getUserId(renterUser.email);
		const res = await request(app)
			.post("/api/appointments/book")
			.set("Authorization", `Bearer ${renterToken}`)
			.send({
				roomId,
				ownerId,
				renterId,
				renterName: renterUser.fullName,
				renterEmail: renterUser.email,
				renterPhone: "9800000001",
				appointmentDate: new Date(),
				appointmentTime: "10:00 AM",
			});
		expect(res.status).toBe(201);
		appointmentId = res.body.data._id;
		expect(res.body.data.status).toBe("pending");
	});

	test("40. Should reject appointment without token", async () => {
		const ownerId = await getUserId(ownerUser.email);
		const renterId = await getUserId(renterUser.email);
		const res = await request(app)
			.post("/api/appointments/book")
			.send({
				roomId,
				ownerId,
				renterId,
				renterName: renterUser.fullName,
				renterEmail: renterUser.email,
				renterPhone: "9800000001",
				appointmentDate: new Date(),
				appointmentTime: "10:00 AM",
			});
		expect(res.status).toBe(401);
	});

	test("41. Should get all appointments", async () => {
		const ownerId = await getUserId(ownerUser.email);
		const res = await request(app)
			.get(`/api/appointments/owner/${ownerId}`)
			.set("Authorization", `Bearer ${ownerToken}`);
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.data)).toBe(true);
	});

	test("42. Should get appointment by ID", async () => {
		const ownerId = await getUserId(ownerUser.email);
		const renterId = await getUserId(renterUser.email);
		const appointmentRes = await request(app)
			.post("/api/appointments/book")
			.set("Authorization", `Bearer ${renterToken}`)
			.send({
				roomId,
				ownerId,
				renterId,
				renterName: renterUser.fullName,
				renterEmail: renterUser.email,
				renterPhone: "9800000001",
				appointmentDate: new Date(),
				appointmentTime: "10:30 AM",
			});
		appointmentId = appointmentRes.body.data._id;

		const res = await request(app)
			.get(`/api/appointments/${appointmentId}`)
			.set("Authorization", `Bearer ${renterToken}`);
		expect(res.status).toBe(200);
		expect(res.body.data._id).toBe(appointmentId);
	});

	test("43. Should update appointment status", async () => {
		const ownerId = await getUserId(ownerUser.email);
		const renterId = await getUserId(renterUser.email);
		const appointmentRes = await request(app)
			.post("/api/appointments/book")
			.set("Authorization", `Bearer ${renterToken}`)
			.send({
				roomId,
				ownerId,
				renterId,
				renterName: renterUser.fullName,
				renterEmail: renterUser.email,
				renterPhone: "9800000001",
				appointmentDate: new Date(),
				appointmentTime: "10:45 AM",
			});
		appointmentId = appointmentRes.body.data._id;

		const res = await request(app)
			.put(`/api/appointments/${appointmentId}/status`)
			.set("Authorization", `Bearer ${ownerToken}`)
			.send({ status: "confirmed" });
		expect(res.status).toBe(200);
		expect(res.body.data.status).toBe("confirmed");
	});

	test("44. Should reject appointment for non-existent room", async () => {
		const fakeId = new mongoose.Types.ObjectId();
		const ownerId = await getUserId(ownerUser.email);
		const renterId = await getUserId(renterUser.email);
		const res = await request(app)
			.post("/api/appointments/book")
			.set("Authorization", `Bearer ${renterToken}`)
			.send({
				roomId: fakeId,
				ownerId,
				renterId,
				renterName: renterUser.fullName,
				renterEmail: renterUser.email,
				renterPhone: "9800000001",
				appointmentDate: new Date(),
				appointmentTime: "10:00 AM",
			});
		expect(res.status).toBe(404);
	});

	test("45. Should cancel appointment", async () => {
		const ownerId = await getUserId(ownerUser.email);
		const renterId = await getUserId(renterUser.email);
		const appointmentRes = await request(app)
			.post("/api/appointments/book")
			.set("Authorization", `Bearer ${renterToken}`)
			.send({
				roomId,
				ownerId,
				renterId,
				renterName: renterUser.fullName,
				renterEmail: renterUser.email,
				renterPhone: "9800000001",
				appointmentDate: new Date(),
				appointmentTime: "11:00 AM",
			});

		const res = await request(app)
			.delete(`/api/appointments/${appointmentRes.body.data._id}`)
			.set("Authorization", `Bearer ${renterToken}`);
		expect(res.status).toBe(200);
	});

	test("46. Should get owner's appointments only", async () => {
		const ownerId = await getUserId(ownerUser.email);
		const res = await request(app)
			.get(`/api/appointments/owner/${ownerId}`)
			.set("Authorization", `Bearer ${ownerToken}`);
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.data)).toBe(true);
	});

	test("47. Should handle concurrent appointment bookings", async () => {
		const ownerId = await getUserId(ownerUser.email);
		const renterId = await getUserId(renterUser.email);

		const [res1, res2] = await Promise.all([
			request(app)
				.post("/api/appointments/book")
				.set("Authorization", `Bearer ${renterToken}`)
				.send({
					roomId,
					ownerId,
					renterId,
					renterName: renterUser.fullName,
					renterEmail: renterUser.email,
					renterPhone: "9800000001",
					appointmentDate: new Date(),
					appointmentTime: "2:00 PM",
				}),
			request(app)
				.post("/api/appointments/book")
				.set("Authorization", `Bearer ${renterToken}`)
				.send({
					roomId,
					ownerId,
					renterId,
					renterName: renterUser.fullName,
					renterEmail: renterUser.email,
					renterPhone: "9800000001",
					appointmentDate: new Date(),
					appointmentTime: "2:15 PM",
				}),
		]);

		expect([res1.status, res2.status]).toContain(201);
	});

	test("48. Should filter appointments by status", async () => {
		const ownerId = await getUserId(ownerUser.email);
		const res = await request(app)
			.get(`/api/appointments/owner/${ownerId}?status=pending`)
			.set("Authorization", `Bearer ${ownerToken}`);
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.data)).toBe(true);
	});

	test("49. Should get appointment details with room info", async () => {
		const ownerId = await getUserId(ownerUser.email);
		const renterId = await getUserId(renterUser.email);

		const appointmentRes = await request(app)
			.post("/api/appointments/book")
			.set("Authorization", `Bearer ${renterToken}`)
			.send({
				roomId,
				ownerId,
				renterId,
				renterName: renterUser.fullName,
				renterEmail: renterUser.email,
				renterPhone: "9800000001",
				appointmentDate: new Date(),
				appointmentTime: "3:00 PM",
			});

		const appointmentId = appointmentRes.body.data._id;

		const res = await request(app)
			.get(`/api/appointments/${appointmentId}`)
			.set("Authorization", `Bearer ${renterToken}`);
		expect(res.status).toBe(200);
		expect(res.body.data).toHaveProperty("roomId");
		expect(res.body.data).toHaveProperty("ownerId");
		expect(res.body.data).toHaveProperty("status");
	});

	test("50. Should allow owner to reject appointment", async () => {
		const ownerId = await getUserId(ownerUser.email);
		const renterId = await getUserId(renterUser.email);

		const appointmentRes = await request(app)
			.post("/api/appointments/book")
			.set("Authorization", `Bearer ${renterToken}`)
			.send({
				roomId,
				ownerId,
				renterId,
				renterName: renterUser.fullName,
				renterEmail: renterUser.email,
				renterPhone: "9800000001",
				appointmentDate: new Date(),
				appointmentTime: "4:00 PM",
			});

		const appointmentId = appointmentRes.body.data._id;

		const res = await request(app)
			.put(`/api/appointments/${appointmentId}/status`)
			.set("Authorization", `Bearer ${ownerToken}`)
			.send({ status: "rejected" });
		expect(res.status).toBe(200);
	});
});
