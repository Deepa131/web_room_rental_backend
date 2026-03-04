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

	test("4. Should create error with 403 forbidden status", () => {
		const error = new HttpError(403, "Forbidden");
		expect(error.statusCode).toBe(403);
		expect(error.message).toBe("Forbidden");
	});

	test("5. Should create error with 404 not found status", () => {
		const error = new HttpError(404, "Resource not found");
		expect(error.statusCode).toBe(404);
		expect(error.message).toBe("Resource not found");
	});

	test("6. Should handle error with empty message", () => {
		const error = new HttpError(400, "");
		expect(error.statusCode).toBe(400);
		expect(error.message).toBe("");
	});

	test("7. Should support custom HTTP status codes", () => {
		const error = new HttpError(422, "Unprocessable entity");
		expect(error.statusCode).toBe(422);
	});

	test("8. Should be instanceof Error", () => {
		const error = new HttpError(500, "Test error");
		expect(error instanceof HttpError).toBe(true);
	});
});
