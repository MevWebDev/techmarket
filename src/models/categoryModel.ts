import prisma from "../config/db";
import { Prisma, Category } from "@prisma/client";

export const createCategory = async (
  category: Omit<Category, "id" | "createdAt" | "updatedAt">
) => {
  const { name, description } = category;

  return await prisma.category.create({
    data: {
      name,
      description,
    },
  });
};

export const getCategoryById = async (id: string) => {
  const categoryId = parseInt(id);
  return await prisma.category.findUnique({
    where: { id: categoryId },
  });
};

export const getAllCategories = async () => {
  return await prisma.category.findMany({});
};

export const getAllCategoryProducts = async (id: string) => {
  const categoryId = parseInt(id);

  return await prisma.category.findUnique({
    where: { id: categoryId },
    include: { products: true },
  });
};

export const updateCategory = async (
  id: string,
  category: Partial<Category>
) => {
  const categoryId = parseInt(id);
  return await prisma.category.update({
    where: { id: categoryId },
    data: { ...category },
  });
};

export const deleteCategory = async (id: string) => {
  const categoryId = parseInt(id);

  // Find a default category or create one
  const defaultCategory =
    (await prisma.category.findUnique({
      where: { name: "Uncategorized" },
    })) ||
    (await prisma.category.create({
      data: { name: "Uncategorized", description: "Default category" },
    }));

  // Move all products to default category
  await prisma.product.updateMany({
    where: { categoryId },
    data: { categoryId: defaultCategory.id },
  });

  // Now delete the category
  return await prisma.category.delete({
    where: { id: categoryId },
  });
};
