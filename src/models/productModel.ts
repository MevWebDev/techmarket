// src/models/productModel.js
import { query, QueryParams } from "../config/db";
import { Product } from "../data/products";

export const createProduct = async (product: Product) => {
  const {
    name,
    category,
    description,
    price,
    stockCount,
    brand,
    imageUrl,
    isAvailable,
  } = product;
  const result = await query(
    "INSERT INTO products (name, category, description, price, stock_count, brand, image_url, is_available) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
    [
      name,
      category,
      description,
      price,
      stockCount,
      brand,
      imageUrl,
      isAvailable,
    ]
  );
  return result.rows[0];
};

export const getProductById = async (id: string) => {
  const result = await query("SELECT * FROM products WHERE id = $1", [id]);
  return result.rows[0];
};

export const getAllProducts = async (params: QueryParams = {}) => {
  const { sortBy, sortOrder, isAvailable } = params;

  // Base query
  let queryString = "SELECT * FROM products";
  const queryParams: any[] = [];
  let paramIndex = 1;

  // Add filters
  if (isAvailable !== undefined) {
    queryString += ` WHERE is_available = $${paramIndex}`;
    queryParams.push(isAvailable);
    paramIndex++;
  }

  // Add sorting
  if (sortBy) {
    const validSortFields = ["name", "price", "created_at"]; // Add valid fields here
    if (validSortFields.includes(sortBy)) {
      queryString += ` ORDER BY ${sortBy} ${
        sortOrder === "desc" ? "DESC" : "ASC"
      }`;
    } else {
      throw new Error("Invalid sort field");
    }
  }

  const result = await query(queryString, queryParams);
  return result.rows;
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const {
    name,
    category,
    description,
    price,
    stockCount,
    brand,
    imageUrl,
    isAvailable,
  } = product;

  const result = await query(
    `UPDATE products 
         SET 
           name = COALESCE($1, name),
           category = COALESCE($2, category),
           description = COALESCE($3, description),
           price = COALESCE($4, price),
           stock_count = COALESCE($5, stock_count),
           brand = COALESCE($6, brand),
           image_url = COALESCE($7, image_url),
           is_available = COALESCE($8, is_available)
         WHERE id = $9
         RETURNING *`,
    [
      name,
      category,
      description,
      price,
      stockCount,
      brand,
      imageUrl,
      isAvailable,
      id,
    ]
  );

  return result.rows[0];
};

export const deleteProduct = async (id: string) => {
  const result = await query("DELETE FROM products WHERE id = $1 RETURNING *", [
    id,
  ]);
  return result.rows[0];
};
