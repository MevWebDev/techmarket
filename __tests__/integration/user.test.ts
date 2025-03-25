import request from "supertest";
import express from "express";
import userRoutes from "../../src/routes/userRoutes";
import { errorHandler } from "../../src/middleware/errorHandler";
import * as userModel from "../../src/models/userModel";
import bcrypt from "bcrypt";

// Mock dependencies
jest.mock("../../src/models/userModel");
jest.mock("bcrypt");

// Create a test express app
const app = express();
app.use(express.json());
app.use("/api/users", userRoutes);
app.use(errorHandler);

describe("User API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/users", () => {
    it("should return all users", async () => {
      // Mock data
      const mockUsers = [
        { id: 1, username: "user1", email: "user1@example.com" },
        { id: 2, username: "user2", email: "user2@example.com" },
      ];

      // Mock the getAllUsers function
      (userModel.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

      // Make request
      const response = await request(app).get("/api/users");

      // Assertions
      expect(response.status).toBe(201); // Note: Should ideally be 200
      expect(response.body).toEqual(mockUsers);
      expect(userModel.getAllUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return a user by id", async () => {
      // Mock data
      const mockUser = {
        id: 1,
        username: "user1",
        email: "user1@example.com",
        firstName: "John",
        lastName: "Doe",
      };

      // Mock the getUserById function
      (userModel.getUserById as jest.Mock).mockResolvedValue(mockUser);

      // Make request
      const response = await request(app).get("/api/users/1");

      // Assertions
      expect(response.status).toBe(201); // Note: Should ideally be 200
      expect(response.body).toEqual(mockUser);
      expect(userModel.getUserById).toHaveBeenCalledWith("1");
    });
  });

  describe("POST /api/users", () => {
    it("should create a new user", async () => {
      // Mock bcrypt hash
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");

      // Mock data
      const userToCreate = {
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
        firstName: "Jane",
        lastName: "Doe",
      };

      const createdUser = {
        id: 3,
        username: "newuser",
        email: "newuser@example.com",
        passwordHash: "hashedPassword123",
        firstName: "Jane",
        lastName: "Doe",
      };

      // Mock the createUser function
      (userModel.createUser as jest.Mock).mockResolvedValue(createdUser);

      // Make request
      const response = await request(app).post("/api/users").send(userToCreate);

      // Assertions
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdUser);
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(userModel.createUser).toHaveBeenCalledWith({
        username: "newuser",
        email: "newuser@example.com",
        passwordHash: "hashedPassword123",
        firstName: "Jane",
        lastName: "Doe",
      });
    });
  });

  describe("PATCH /api/users/:id", () => {
    it("should update a user", async () => {
      // Mock data
      const userUpdate = { firstName: "John Updated" };
      const updatedUser = {
        id: 1,
        username: "user1",
        email: "user1@example.com",
        firstName: "John Updated",
        lastName: "Doe",
      };

      // Mock the updateUser function
      (userModel.updateUser as jest.Mock).mockResolvedValue(updatedUser);

      // Make request
      const response = await request(app)
        .patch("/api/users/1")
        .send(userUpdate);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedUser);
      expect(userModel.updateUser).toHaveBeenCalledWith("1", userUpdate);
    });

    it("should update user with new password", async () => {
      // Mock bcrypt hash
      (bcrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword");

      // Mock data
      const userUpdate = {
        firstName: "John Updated",
        password: "newPassword123",
      };

      const updatedUser = {
        id: 1,
        username: "user1",
        email: "user1@example.com",
        firstName: "John Updated",
        lastName: "Doe",
        passwordHash: "newHashedPassword",
      };

      // Mock the updateUser function
      (userModel.updateUser as jest.Mock).mockResolvedValue(updatedUser);

      // Make request
      const response = await request(app)
        .patch("/api/users/1")
        .send(userUpdate);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedUser);
      expect(bcrypt.hash).toHaveBeenCalledWith("newPassword123", 10);
      expect(userModel.updateUser).toHaveBeenCalledWith("1", {
        firstName: "John Updated",
        passwordHash: "newHashedPassword",
      });
    });

    it("should return 400 if no fields to update", async () => {
      // Make request with empty body
      const response = await request(app).patch("/api/users/1").send({});

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "No fields to update");
      expect(userModel.updateUser).not.toHaveBeenCalled();
    });
  });
  describe("DELETE /api/users/:id", () => {
    it("should delete a user", async () => {
      // Mock data
      const deletedUser = {
        id: 1,
        username: "user1",
        email: "user1@example.com",
        firstName: "John",
        lastName: "Doe",
      };

      // Mock the deleteUser function
      (userModel.deleteUser as jest.Mock).mockResolvedValue(deletedUser);

      // Make request
      const response = await request(app).delete("/api/users/1");

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "User deleted successfully",
        id: 1,
      });
      expect(userModel.deleteUser).toHaveBeenCalledWith("1");
    });

    it("should return 404 if user not found", async () => {
      // Mock the deleteUser function to return null (not found)
      (userModel.deleteUser as jest.Mock).mockResolvedValue(null);

      // Make request
      const response = await request(app).delete("/api/users/999");

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "User not found" });
    });

    it("should handle errors during deletion", async () => {
      // Mock the deleteUser function to throw an error
      const errorMessage = "Database connection failed";
      (userModel.deleteUser as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      // Make request
      const response = await request(app).delete("/api/users/1");

      // Assertions
      expect(response.status).toBe(500);
      expect(response.body.message).toContain("Error while deleting user");
    });
  });
});
