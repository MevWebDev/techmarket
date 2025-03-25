import request from "supertest";
import express from "express";
import productRoutes from "../../src/routes/productRoutes";
import { errorHandler } from "../../src/middleware/errorHandler";
import * as productModel from "../../src/models/productModel";

// Mock the product model
jest.mock("../../src/models/productModel");

// Create a test express app
const app = express();
app.use(express.json());
app.use("/api/products", productRoutes);
app.use(errorHandler);

describe("Product API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/products", () => {
    it("should return all products", async () => {
      // Mock data
      const mockProducts = [
        { id: 1, name: "Test Product 1", price: 99.99 },
        { id: 2, name: "Test Product 2", price: 199.99 },
      ];

      // Mock the getAllProducts function
      (productModel.getAllProducts as jest.Mock).mockResolvedValue(
        mockProducts
      );

      // Make request
      const response = await request(app).get("/api/products");

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProducts);
      expect(productModel.getAllProducts).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /api/products/:id", () => {
    it("should return a product by id", async () => {
      // Mock data
      const mockProduct = { id: 1, name: "Test Product", price: 99.99 };

      // Mock the getProductById function
      (productModel.getProductById as jest.Mock).mockResolvedValue(mockProduct);

      // Make request
      const response = await request(app).get("/api/products/1");

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
      expect(productModel.getProductById).toHaveBeenCalledWith("1");
    });

    it("should return 404 if product not found", async () => {
      // Mock the getProductById function to return null (not found)
      (productModel.getProductById as jest.Mock).mockResolvedValue(null);

      // Make request
      const response = await request(app).get("/api/products/999");

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Product not found");
    });
  });

  describe("POST /api/products", () => {
    it("should create a new product", async () => {
      // Mock data
      const productToCreate = {
        name: "New Product",
        price: 49.99,
        categoryId: 1,
        brand: "Test Brand",
        stockCount: 100,
        description: "Test description",
        isAvailable: true,
      };

      const createdProduct = { id: 3, ...productToCreate };

      // Mock the createProduct function
      (productModel.createProduct as jest.Mock).mockResolvedValue(
        createdProduct
      );

      // Make request
      const response = await request(app)
        .post("/api/products")
        .send(productToCreate);

      // Assertions
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdProduct);
      expect(productModel.createProduct).toHaveBeenCalledWith(productToCreate);
    });
  });

  describe("PATCH /api/products/:id", () => {
    it("should update a product", async () => {
      // Mock data
      const productUpdate = { price: 59.99 };
      const updatedProduct = { id: 1, name: "Test Product", price: 59.99 };

      // Mock the updateProduct function
      (productModel.updateProduct as jest.Mock).mockResolvedValue(
        updatedProduct
      );

      // Make request
      const response = await request(app)
        .patch("/api/products/1")
        .send(productUpdate);

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedProduct);
      expect(productModel.updateProduct).toHaveBeenCalledWith(
        "1",
        productUpdate
      );
    });
  });

  describe("DELETE /api/products/:id", () => {
    it("should delete a product", async () => {
      // Mock data
      const deletedProduct = { id: 1, name: "Test Product", price: 99.99 };

      // Mock the deleteProduct function
      (productModel.deleteProduct as jest.Mock).mockResolvedValue(
        deletedProduct
      );

      // Make request
      const response = await request(app).delete("/api/products/1");

      // Assertions
      expect(response.status).toBe(204);
    });
  });
});
