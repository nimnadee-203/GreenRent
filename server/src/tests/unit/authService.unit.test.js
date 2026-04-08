/**
 * AUTH SERVICE UNIT TEST (Intermediate Level)
 * 
 * Goal: Test the logic of registration and login WITHOUT connecting to a real database.
 * 
 * Concepts used:
 * - Mocking: Creating "fake" versions of dependencies (like the Database models) 
 *   so we can control exactly what they return.
 * - Spies (jest.fn): Tracking if a function was called.
 */

import { jest } from "@jest/globals";

// --- MOCKING SECTION ---
// We "mock" the database models so they don't actually try to connect to MongoDB.
jest.unstable_mockModule("../../models/userModel.js", () => ({
  default: {
    findOne: jest.fn(), // Fake "find" function
    create: jest.fn(),  // Fake "create" function
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule("../../models/UserPreference.js", () => ({
  default: {
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

// We mock the email service so we don't send real emails during tests.
jest.unstable_mockModule("../../config/nodemailer.js", () => ({
  default: {
    sendMail: jest.fn().mockResolvedValue({ messageId: "test-id" }),
  },
}));

// Mock bcrypt and jwt to keep tests fast and predictable
jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    hash: jest.fn().mockResolvedValue("hashed_password_mock"),
    compare: jest.fn().mockResolvedValue(true),
  },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn().mockReturnValue("fake_token_123"),
    verify: jest.fn().mockReturnValue({ id: "user123" }),
  },
}));

// --- IMPORTING SECTION ---
// In ESM, we must use dynamic import after defining mocks.
const { registerUser, loginUser, socialLogin } = await import("../../services/authService.js");
const { default: userModel } = await import("../../models/userModel.js");

describe("Unit Tests: Authentication Logic", () => {
  
  // Clear all "memory" of previous function calls before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("User Registration", () => {
    
    test("Should fail if the email is already taken", async () => {
      // SETUP: Simulate the database finding a user with this email
      userModel.findOne.mockResolvedValue({ email: "already@exists.com" });

      // ACTION & ASSERTION: Expect the function to throw an error
      await expect(registerUser("Tester", "already@exists.com", "pass123"))
        .rejects.toThrow("User already exists");
    });

    test("Should create a new user successfully", async () => {
      // SETUP: Simulate database being empty (findOne returns null)
      userModel.findOne.mockResolvedValue(null);
      // Simulate database creating a user object
      userModel.create.mockResolvedValue({
        _id: "new_id",
        name: "New User",
        email: "new@user.com",
      });

      // ACTION
      const result = await registerUser("New User", "new@user.com", "pass123");

      // ASSERTION: Verify the result is what we expect
      expect(userModel.create).toHaveBeenCalled(); // Check if create() was called
      expect(result.user.name).toBe("New User");
      expect(result.token).toBe("fake_token_123"); // From our mock
    });
  });

  describe("Social Login (Google)", () => {
    
    test("Should register a NEW user if logging in for the first time via Google", async () => {
      // SETUP
      userModel.findOne.mockResolvedValue(null);
      userModel.create.mockResolvedValue({ _id: "google_user_id", email: "google@gmail.com" });

      // ACTION
      const result = await socialLogin("Google User", "google@gmail.com", "photo.jpg");

      // ASSERTION
      expect(userModel.create).toHaveBeenCalled(); // Should trigger a registration
      expect(result.user.email).toBe("google@gmail.com");
    });

  });
});
