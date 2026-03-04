import { UserRepository } from "../../repositories/user.repository";
import { UserModel } from "../../models/user.model";
import mongoose from "mongoose";

jest.mock("../../models/user.model");

const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;

describe("UserRepository Unit Tests", () => {
	let userRepository: UserRepository;

	beforeEach(() => {
		jest.clearAllMocks();
		userRepository = new UserRepository();
	});

	describe("createUser", () => {
		test("1. Should create and return a new user", async () => {
			const newUser = {
				_id: new mongoose.Types.ObjectId(),
				email: "test@example.com",
				fullName: "Test User",
				password: "hashed",
				role: "renter" as const
			};

			const mockSave = jest.fn().mockResolvedValue(newUser);
			(UserModel as any).mockImplementation(() => ({
				save: mockSave
			}));

			const result = await userRepository.createUser(newUser);
			expect(mockSave).toHaveBeenCalled();
		});
	});

	describe("getUserByEmail", () => {
		test("2. Should return user when email exists", async () => {
			const user = {
				_id: "123",
				email: "test@example.com",
				fullName: "Test User",
				role: "renter"
			};

			const mockSelect = jest.fn().mockResolvedValue(user);
			const mockFindOne = jest.fn().mockReturnValue({
				select: mockSelect
			});

			(UserModel.findOne as jest.Mock) = mockFindOne;

			const result = await userRepository.getUserByEmail("test@example.com");
			expect(mockFindOne).toHaveBeenCalledWith({ email: "test@example.com" });
		});

		test("3. Should return null when email doesn't exist", async () => {
			const mockSelect = jest.fn().mockResolvedValue(null);
			const mockFindOne = jest.fn().mockReturnValue({
				select: mockSelect
			});

			(UserModel.findOne as jest.Mock) = mockFindOne;

			const result = await userRepository.getUserByEmail("nonexistent@example.com");
			expect(mockFindOne).toHaveBeenCalled();
		});
	});

	describe("getUserById", () => {
		test("4. Should return user by ID", async () => {
			const userId = "123";
			const user = {
				_id: userId,
				email: "test@example.com",
				fullName: "Test User",
				role: "renter"
			};

			(UserModel.findById as jest.Mock) = jest.fn().mockResolvedValue(user);

			const result = await userRepository.getUserById(userId);
			expect(UserModel.findById).toHaveBeenCalledWith(userId);
		});

		test("5. Should return null for non-existent user", async () => {
			(UserModel.findById as jest.Mock) = jest.fn().mockResolvedValue(null);

			const result = await userRepository.getUserById("nonexistent");
			expect(result).toBeNull();
		});
	});

	describe("getUsersPaginated", () => {
		test("6. Should return paginated users", async () => {
			const users = [
				{ _id: "1", email: "user1@example.com" },
				{ _id: "2", email: "user2@example.com" }
			];

			const mockSkip = jest.fn().mockReturnValue({
				limit: jest.fn().mockResolvedValue(users)
			});

			(UserModel.find as jest.Mock) = jest.fn().mockReturnValue({
				skip: mockSkip
			});

			(UserModel.countDocuments as jest.Mock) = jest.fn().mockResolvedValue(10);

			const result = await userRepository.getUsersPaginated(1, 2);
			expect(result.users).toBeTruthy();
			expect(UserModel.countDocuments).toHaveBeenCalled();
		});
	});

	describe("updateUser", () => {
		test("7. Should update user with new data", async () => {
			const userId = "123";
			const updateData = { fullName: "Updated Name" };
			const updatedUser = { _id: userId, email: "test@example.com", ...updateData };

			(UserModel.findByIdAndUpdate as jest.Mock) = jest.fn().mockResolvedValue(updatedUser);

			const result = await userRepository.updateUser(userId, updateData as any);
			expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, updateData, { new: true });
		});
	});

	describe("deleteUser", () => {
		test("8. Should delete user by ID", async () => {
			const userId = "123";
			const deletedUser = { _id: userId, email: "test@example.com" };

			(UserModel.findByIdAndDelete as jest.Mock) = jest.fn().mockResolvedValue(deletedUser);

			const result = await userRepository.deleteUser(userId);
			expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith(userId);
		});
	});

	describe("getUserByResetToken", () => {
		test("9. Should return user by reset token", async () => {
			const tokenHash = "hash123";
			const user = { 
				_id: "123",
				email: "test@example.com",
				resetPasswordToken: tokenHash,
				resetPasswordExpire: new Date(Date.now() + 3600000)
			};

			const mockSelect = jest.fn().mockResolvedValue(user);
			const mockFindOne = jest.fn().mockReturnValue({
				select: mockSelect
			});

			(UserModel.findOne as jest.Mock) = mockFindOne;

			const result = await userRepository.getUserByResetToken(tokenHash);
			expect(mockFindOne).toHaveBeenCalled();
		});
	});

	describe("getAllUsers", () => {
		test("10. Should return all users", async () => {
			const users = [
				{ _id: "1", email: "user1@example.com" },
				{ _id: "2", email: "user2@example.com" }
			];

			(UserModel.find as jest.Mock) = jest.fn().mockResolvedValue(users);

			const result = await userRepository.getAllUsers();
			expect(UserModel.find).toHaveBeenCalled();
		});
	});
});
