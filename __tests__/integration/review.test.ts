import request from "supertest";
import express from "express";
import reviewRoutes from "../../src/routes/reviewRoutes";
import { errorHandler } from "../../src/middleware/errorHandler";
import * as reviewModel from "../../src/models/reviewModel";

// Mock the review model
jest.mock("../../src/models/reviewModel");

// Create a test express app
const app = express();
app.use(express.json());
app.use("/api/reviews", reviewRoutes);
app.use(errorHandler);

describe("Review API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/reviews", () => {
    it("should return all reviews", async () => {
      // Mock data
      const mockReviews = [
        { id: 1, userId: 1, productId: 1, rating: 5, comment: "Great product" },
        { id: 2, userId: 2, productId: 1, rating: 4, comment: "Good product" },
      ];

      // Mock the getAllReviews function
      (reviewModel.getAllReviews as jest.Mock).mockResolvedValue(mockReviews);

      // Make request
      const response = await request(app).get("/api/reviews");

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockReviews);
      expect(reviewModel.getAllReviews).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /api/reviews/:id", () => {
    it("should return a review by id", async () => {
      // Mock data
      const mockReview = {
        id: 1,
        userId: 1,
        productId: 1,
        rating: 5,
        comment: "Great product",
        user: { id: 1, username: "user1" },
        product: { id: 1, name: "Product 1" },
      };

      // Mock the getReviewById function
      (reviewModel.getReviewById as jest.Mock).mockResolvedValue(mockReview);

      // Make request
      const response = await request(app).get("/api/reviews/1");

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockReview);
      expect(reviewModel.getReviewById).toHaveBeenCalledWith("1");
    });
  });

  describe("POST /api/reviews", () => {
    it("should create a new review", async () => {
      // Mock data
      const reviewToCreate = {
        userId: 1,
        productId: 3,
        rating: 5,
        comment: "Great product",
      };

      const createdReview = {
        id: 1,
        ...reviewToCreate,
        userId: 1,
        productId: 3,
        rating: 5,
        comment: "Great product",
        createdAt: { inverse: false },
        updatedAt: { inverse: false },
      };

      // Mock the addReview function
      (reviewModel.addReview as jest.Mock).mockResolvedValue(createdReview);

      // Make request
      const response = await request(app)
        .post("/api/reviews")
        .send(reviewToCreate);

      // Assertions
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdReview);
      expect(reviewModel.addReview).toHaveBeenCalledWith(reviewToCreate);
    });

    it("should return 400 if rating is invalid", async () => {
      // Mock data with invalid rating
      const reviewToCreate = {
        userId: 1,
        productId: 1,
        rating: 6, // Invalid: > 5
        comment: "Great product",
      };

      // Make request
      const response = await request(app)
        .post("/api/reviews")
        .send(reviewToCreate);

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Rating must be an integer between 1 and 5"
      );
      expect(reviewModel.addReview).not.toHaveBeenCalled();
    });
  });

  describe("PATCH /api/reviews/:id", () => {
    it("should update a review", async () => {
      // Mock data
      const reviewUpdate = { rating: 4, comment: "Updated comment" };
      const updatedReview = {
        id: 1,
        userId: 1,
        productId: 1,
        rating: 4,
        comment: "Updated comment",
      };

      // Mock the updateReview function
      (reviewModel.updateReview as jest.Mock).mockResolvedValue(updatedReview);

      // Make request
      const response = await request(app)
        .patch("/api/reviews/1")
        .send(reviewUpdate);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedReview);
      expect(reviewModel.updateReview).toHaveBeenCalledWith("1", reviewUpdate);
    });

    it("should return 404 if review not found", async () => {
      // Mock the updateReview function to return null (not found)
      (reviewModel.updateReview as jest.Mock).mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .patch("/api/reviews/999")
        .send({ rating: 3 });

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Review not found");
    });

    it("should return 400 if rating is invalid", async () => {
      // Mock data with invalid rating
      const reviewUpdate = { rating: 0 }; // Invalid: < 1

      // Make request
      const response = await request(app)
        .patch("/api/reviews/1")
        .send(reviewUpdate);

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Rating must be an integer between 1 and 5"
      );
      // CHANGE THIS LINE:
      // The model should NOT be called when validation fails
      expect(reviewModel.updateReview).not.toHaveBeenCalled();
    });
  });
  describe("DELETE /api/reviews/:id", () => {
    it("should delete a review", async () => {
      // Mock data
      const deletedReview = {
        id: 1,
        userId: 1,
        productId: 1,
        rating: 5,
        comment: "Great product",
      };

      // Mock the deleteReview function
      (reviewModel.deleteReview as jest.Mock).mockResolvedValue(deletedReview);

      // Make request
      const response = await request(app).delete("/api/reviews/1");

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toBe("Review deleted successfully");
      expect(reviewModel.deleteReview).toHaveBeenCalledWith("1");
    });

    it("should return 404 if review not found", async () => {
      // Mock the deleteReview function to return null (not found)
      (reviewModel.deleteReview as jest.Mock).mockResolvedValue(null);

      // Make request
      const response = await request(app).delete("/api/reviews/999");

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body).toBe("Review not found");
    });
  });
});
