import { Request, Response } from "express";
import { products, Product } from "../data/products";

export const getProducts = (req: Request, res: Response) => {
  res.json(products);
};

export const getProductById = (req: Request, res: Response) => {
  const productId = parseInt(req.params.id);
  const product = products.find((p) => p.id === productId);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};

export const createProduct = (req: Request, res: Response) => {
  const newProduct: Product = {
    id: products.length + 1,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
};

export const updateProduct = (req: Request, res: Response) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex((p) => p.id === productId);
  if (productIndex !== -1) {
    products[productIndex] = { ...products[productIndex], ...req.body };
    res.json(products[productIndex]);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};

export const deleteProduct = (req: Request, res: Response) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex((p) => p.id === productId);
  if (productIndex !== -1) {
    products.splice(productIndex, 1);
    res.status(200).json({ message: "Deleted succesfully" });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};
