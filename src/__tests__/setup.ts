import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
	process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";

	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();

	await mongoose.connect(uri);
});

afterEach(async () => {
	if (!mongoose.connection.db) {
		return;
	}

	const collections = await mongoose.connection.db.collections();

	for (const collection of collections) {
		await collection.deleteMany({});
	}
});

afterAll(async () => {
	await mongoose.disconnect();
	await mongoServer.stop();
});
