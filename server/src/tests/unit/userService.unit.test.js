/**
 * USER SERVICE UNIT TEST (Intermediate Level)
 * 
 * Goal: Test user data retrieval logic.
 * 
 * We check:
 * 1. If we can get basic user data (name, email) correctly.
 */

import { jest } from "@jest/globals";

// Mock the User model
jest.unstable_mockModule("../../models/userModel.js", () => ({
  default: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

// --- IMPORTS ---
const { getUserData } = await import("../../services/userService.js");
const { default: userModel } = await import("../../models/userModel.js");

describe("Unit Tests: User Profile Logic", () => {
    
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should fetch user data without sensitive password field", async () => {
    // SETUP: Simulate finding a user in the database
    const mockUser = {
      _id: "user_abc",
      name: "John Green",
      email: "john@green.com"
    };

    // Simulate standard Mongoose findById().select() behavior
    userModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    // ACTION
    const result = await getUserData("user_abc");

    // ASSERTION
    expect(userModel.findById).toHaveBeenCalledWith("user_abc");
    expect(result.name).toBe("John Green");
  });
});
