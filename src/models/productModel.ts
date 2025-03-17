// src/models/productModel.js
import prisma from "../config/db";
import { Prisma, Product } from "@prisma/client";

export interface QueryParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isAvailable?: boolean;
}

export const createProduct = async (
  product: Omit<Product, "id" | "createdAt" | "updatedAt">
) => {
  const {
    name,
    categoryId,
    description,
    price,
    stockCount,
    brand,
    imageUrl,
    isAvailable,
  } = product;

  // Prepare basic product data
  const data: Prisma.ProductCreateInput = {
    name,
    description,
    price,
    stockCount,
    brand,
    imageUrl,
    isAvailable,
    category: undefined as any,
  };

  // Handle category connection
  if (categoryId) {
    // Connect to existing category if categoryId is provided
    data.category = {
      connect: { id: categoryId },
    };
  } else {
    // Create or connect to default category if no categoryId
    data.category = {
      connectOrCreate: {
        where: { name: "Uncategorized" },
        create: {
          name: "Uncategorized",
          description: "Default category for products",
        },
      },
    };
  }

  return await prisma.product.create({
    data,
    include: {
      category: true,
    },
  });
};

export const getProductById = async (id: string) => {
  const productId = parseInt(id);

  if (isNaN(productId)) {
    throw new Error("Invalid product ID format");
  }
  return await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      category: true,
    },
  });
};

export const getAllProducts = async (params: QueryParams = {}) => {
  const { sortBy, sortOrder, isAvailable } = params;

  const where: Prisma.ProductWhereInput = {};

  if (isAvailable !== undefined) {
    where.isAvailable = isAvailable;
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput | undefined;

  if (sortBy) {
    const validSortFields = ["name", "price", "createdAt", "stockCount"];
    if (validSortFields.includes(sortBy)) {
      orderBy = {
        [sortBy]: sortOrder?.toLowerCase() === "desc" ? "desc" : "asc",
      };
    } else {
      throw new Error(`Invalid sort field: ${sortBy}`);
    }
  }
  return await prisma.product.findMany({
    where,
    orderBy,
    include: {
      category: true,
    },
  });
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const productId = parseInt(id);

  if (isNaN(productId)) {
    throw new Error("Invalid product ID format");
  }

  const updateData: Prisma.ProductUpdateInput = {
    ...product,
  };

  if ("categoryId" in product) {
    updateData.category = {
      connect: { id: product.categoryId as number },
    };
  }

  return await prisma.product.update({
    where: { id: productId },
    data: updateData,
    include: { category: true },
  });
};

export const deleteProduct = async (id: string) => {
  const productId = parseInt(id);

  if (isNaN(productId)) {
    throw new Error("Invalid product ID format");
  }

  return await prisma.product.delete({
    where: {
      id: productId,
    },
    include: {
      category: true,
    },
  });
};
