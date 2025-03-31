// __tests__/integration/cart.test.ts
import request from "supertest";
import express from "express";
import cartRoutes from "../../src/routes/cartRoutes";
import { errorHandler } from "../../src/middleware/errorHandler";
import Cart from "../../src/models/cartModel";
import * as productModel from "../../src/models/productModel";

// Mock dependencies
jest.mock("../../src/models/cartModel");
jest.mock("../../src/models/productModel");

// Create a test express app
const app = express();
app.use(express.json());
app.use("/api/cart", cartRoutes);
app.use(errorHandler);

describe("Cart API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/cart/:userId", () => {
    it("should return cart for a user", async () => {
      // Mock data
      const userId = "user123";
      const mockCart = {
        _id: "cart1",
        userId,
        items: [{ productId: 1, quantity: 2 }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockProduct = {
        id: 1,
        name: "Test Product",
        price: 99.99,
        imageUrl: "test.jpg",
      };

      // Mock the Cart.findOne function
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      // Mock the getProductById function
      (productModel.getProductById as jest.Mock).mockResolvedValue(mockProduct);

      // Make request
      const response = await request(app).get(`/api/cart/${userId}`);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("userId", userId);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0]).toHaveProperty("productId", 1);
      expect(response.body.items[0]).toHaveProperty("quantity", 2);
      expect(response.body.items[0]).toHaveProperty("product");
      expect(response.body.items[0].product).toHaveProperty(
        "name",
        "Test Product"
      );
    });

    it("should return empty cart if not found", async () => {
      // Mock the Cart.findOne function to return null
      (Cart.findOne as jest.Mock).mockResolvedValue(null);

      // Make request
      const response = await request(app).get("/api/cart/nonexistent");

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ userId: "nonexistent", items: [] });
    });

    it("should handle error", async () => {
      // Mock the Cart.findOne function to throw an error
      (Cart.findOne as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      // Make request
      const response = await request(app).get("/api/cart/user123");

      // Assertions
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("Error fetching cart");
    });
  });

  describe("POST /api/cart", () => {
    it("should add item to cart when cart exists", async () => {
      // Mock data
      const userId = "user123";
      const productId = 1;
      const quantity = 2;

      const mockCart = {
        _id: "cart1",
        userId,
        items: [],
        save: jest.fn().mockResolvedValue(true),
      };

      const mockProduct = {
        id: 1,
        name: "Test Product",
        price: 99.99,
        imageUrl: "test.jpg",
      };

      // Mock functions
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);
      (productModel.getProductById as jest.Mock).mockResolvedValue(mockProduct);

      // For fetchCartData after save
      const mockCartAfterSave = {
        _id: "cart1",
        userId,
        items: [{ productId: 1, quantity: 2 }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (Cart.findOne as jest.Mock)
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce(mockCartAfterSave);

      // Make request
      const response = await request(app)
        .post("/api/cart")
        .send({ userId, productId, quantity });

      // Assertions
      expect(response.status).toBe(201);
      expect(mockCart.save).toHaveBeenCalled();
      expect(response.body).toHaveProperty("userId", userId);
    });

    it("should create new cart when cart doesn't exist", async () => {
      // Mock data
      const userId = "user123";
      const productId = 1;
      const quantity = 2;

      const mockProduct = {
        id: 1,
        name: "Test Product",
        price: 99.99,
        imageUrl: "test.jpg",
      };

      // Mock Cart.findOne to return null first time
      (Cart.findOne as jest.Mock).mockResolvedValueOnce(null);
      (productModel.getProductById as jest.Mock).mockResolvedValue(mockProduct);

      // Mock Cart constructor and save method
      const mockCartInstance = {
        userId,
        items: [],
        save: jest.fn().mockResolvedValue(true),
      };
      (Cart as unknown as jest.Mock).mockImplementation(() => mockCartInstance);

      // Mock fetchCartData after save
      const mockCartAfterSave = {
        _id: "cart1",
        userId,
        items: [{ productId: 1, quantity: 2 }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (Cart.findOne as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockCartAfterSave);

      // Make request
      const response = await request(app)
        .post("/api/cart")
        .send({ userId, productId, quantity });

      // Assertions
      expect(response.status).toBe(201);
      expect(mockCartInstance.save).toHaveBeenCalled();
      expect(Cart).toHaveBeenCalledWith({ userId, items: [] });
    });

    it("should return 400 if userId or productId is missing", async () => {
      // Make request with missing productId
      const response = await request(app)
        .post("/api/cart")
        .send({ userId: "user123" });

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "userId and productId are required"
      );
    });

    it("should return 404 if product not found", async () => {
      // Mock productModel.getProductById to return null
      (productModel.getProductById as jest.Mock).mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .post("/api/cart")
        .send({ userId: "user123", productId: 999 });

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Product not found");
    });
  });

  describe("PUT /api/cart", () => {
    it("should update item quantity", async () => {
      // Mock data
      const userId = "user123";
      const productId = 1;
      const quantity = 5;

      const mockCart = {
        _id: "cart1",
        userId,
        items: [{ productId: 1, quantity: 2 }],
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock functions
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      // For fetchCartData after save
      const mockCartAfterSave = {
        _id: "cart1",
        userId,
        items: [{ productId: 1, quantity: 5 }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (Cart.findOne as jest.Mock)
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce(mockCartAfterSave);

      // Make request
      const response = await request(app)
        .put("/api/cart")
        .send({ userId, productId, quantity });

      // Assertions
      expect(response.status).toBe(200);
      expect(mockCart.save).toHaveBeenCalled();
      expect(mockCart.items[0].quantity).toBe(5);
    });

    it("should remove item when quantity is 0", async () => {
      // Mock data
      const userId = "user123";
      const productId = 1;
      const quantity = 0;

      const mockCart = {
        _id: "cart1",
        userId,
        items: [{ productId: 1, quantity: 2 }],
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock functions
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      // For fetchCartData after save
      const mockCartAfterSave = {
        _id: "cart1",
        userId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (Cart.findOne as jest.Mock)
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce(mockCartAfterSave);

      // Make request
      const response = await request(app)
        .put("/api/cart")
        .send({ userId, productId, quantity });

      // Assertions
      expect(response.status).toBe(200);
      expect(mockCart.save).toHaveBeenCalled();
      expect(mockCart.items).toHaveLength(0);
    });

    it("should return 404 if cart not found", async () => {
      // Mock Cart.findOne to return null
      (Cart.findOne as jest.Mock).mockResolvedValue(null);

      // Make request
      const response = await request(app)
        .put("/api/cart")
        .send({ userId: "nonexistent", productId: 1, quantity: 3 });

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Cart not found");
    });
  });

  describe("DELETE /api/cart/:userId/items/:productId", () => {
    it("should remove item from cart", async () => {
      // Mock data
      const userId = "user123";
      const productId = 1;

      const mockCart = {
        _id: "cart1",
        userId,
        items: [{ productId: 1, quantity: 2 }],
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock functions
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      // For fetchCartData after save
      const mockCartAfterSave = {
        _id: "cart1",
        userId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (Cart.findOne as jest.Mock)
        .mockResolvedValueOnce(mockCart)
        .mockResolvedValueOnce(mockCartAfterSave);

      // Make request
      const response = await request(app).delete(
        `/api/cart/${userId}/items/${productId}`
      );

      // Assertions
      expect(response.status).toBe(200);
      expect(mockCart.save).toHaveBeenCalled();
      expect(mockCart.items).toHaveLength(0);
    });

    it("should return 404 if cart not found", async () => {
      // Mock Cart.findOne to return null
      (Cart.findOne as jest.Mock).mockResolvedValue(null);

      // Make request
      const response = await request(app).delete(
        "/api/cart/nonexistent/items/1"
      );

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Cart not found");
    });

    it("should return 404 if product not found in cart", async () => {
      // Mock data
      const mockCart = {
        _id: "cart1",
        userId: "user123",
        items: [{ productId: 1, quantity: 2 }],
      };

      // Mock Cart.findOne
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      // Make request for a product not in the cart
      const response = await request(app).delete("/api/cart/user123/items/999");

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Product not found in cart");
    });
  });

  describe("DELETE /api/cart/:userId", () => {
    it("should clear cart", async () => {
      // Mock data
      const userId = "user123";

      const mockCart = {
        _id: "cart1",
        userId,
        items: [{ productId: 1, quantity: 2 }],
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock functions
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCart);

      // Make request
      const response = await request(app).delete(`/api/cart/${userId}`);

      // Assertions
      expect(response.status).toBe(200);
      expect(mockCart.save).toHaveBeenCalled();
      expect(mockCart.items).toHaveLength(0);
      expect(response.body.message).toBe("Cart cleared successfully");
      expect(response.body.userId).toBe(userId);
    });

    it("should return 404 if cart not found", async () => {
      // Mock Cart.findOne to return null
      (Cart.findOne as jest.Mock).mockResolvedValue(null);

      // Make request
      const response = await request(app).delete("/api/cart/nonexistent");

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Cart not found");
    });
  });
});
