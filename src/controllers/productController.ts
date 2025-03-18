// src/controllers/productController.js
import * as productModel from "../models/productModel";
import { Request, Response } from "express";
import { QueryParams } from "../models/productModel";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const newProduct = await productModel.createProduct(req.body);
    res.status(201).json(newProduct);
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(400).json({ message: "Product with ID already exists" });
    } else {
      console.error("Error creating product:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await productModel.getProductById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { sortBy, sortOrder, isAvailable } = req.query;

    // Parse query parameters
    const params: QueryParams = {
      sortBy: sortBy as string,
      sortOrder: sortOrder as "asc" | "desc",
      isAvailable:
        isAvailable === "true"
          ? true
          : isAvailable === "false"
          ? false
          : undefined,
    };

    const products = await productModel.getAllProducts(params);
    res.json(products);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error fetching products:", err.message);
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unknown error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const products = await productModel.getProductsByCategory(req.params.id);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products by category" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const updatedProduct = await productModel.updateProduct(
      req.params.id,
      req.body
    );
    if (updatedProduct) {
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "Error updating product" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const deletedProduct = await productModel.deleteProduct(req.params.id);
    if (deletedProduct) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Error deleting product" });
  }
};
