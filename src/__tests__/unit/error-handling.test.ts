import { HttpError } from "../../errors/http-error";

describe("Error Handling Unit Tests", () => {
	test("1. Should create HttpError with correct status code", () => {
		const error = new HttpError(400, "Bad request");
		expect(error.statusCode).toBe(400);
		expect(error.message).toBe("Bad request");
	});

	test("2. Should create error with 401 unauthorized status", () => {
		const error = new HttpError(401, "Unauthorized");
		expect(error.statusCode).toBe(401);
	});

	test("3. Should create error with 500 internal server error status", () => {
		const error = new HttpError(500, "Internal server error");
		expect(error.statusCode).toBe(500);
		expect(error.message).toMatch(/server error/i);
	});
});
