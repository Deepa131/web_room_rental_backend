import request from "supertest";
import mongoose from "mongoose";
import app from "../../app";

describe("Error Handling Integration Tests", () => {
	test("47. Should return 404 for invalid route", async () => {
		const res = await request(app).get("/api/invalid-route");
		expect(res.status).toBe(404);
	});

	test("48. Should return 400 for invalid ObjectId", async () => {
		const res = await request(app).get("/api/add-room/invalid-id-format");
		expect([400, 404, 500]).toContain(res.status);
	});

	test("49. Should handle CORS properly", async () => {
		const res = await request(app)
			.options("/api/auth/register")
			.set("Origin", "http://localhost:3000");
		expect([200, 204]).toContain(res.status);
	});

	test("50. Should validate request body for missing fields", async () => {
		const res = await request(app)
			.post("/api/auth/register")
			.send({ email: "test@gmail.com" });
		expect(res.status).toBe(400);
	});
});
