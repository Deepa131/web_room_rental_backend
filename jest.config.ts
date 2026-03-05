import type { Config } from "jest";

const config: Config = {
	preset: "ts-jest",
	testEnvironment: "node",
	testMatch: ["**/__tests__/**/*.test.ts"],
	setupFiles: ["<rootDir>/src/__tests__/jest.setup.ts"],
	setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
	clearMocks: true,
	verbose: true,
};

export default config;
