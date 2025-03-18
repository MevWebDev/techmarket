import * as categoryModel from "../models/categoryModel";
import { Request, Response } from "express";

export const createCategory = async (req: Request, res: Response) => {
  try {
    const newCategory = await categoryModel.createCategory(req.body);
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: "Error while creating category" });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await categoryModel.getCategoryById(req.params.id);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error while searching category" });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const allCategories = await categoryModel.getAllCategories();
    res.status(201).json(allCategories);
  } catch (error) {
    res.status(500).json({ message: "Error while searching category" });
  }
};

export const getAllCategoryProducts = async (req: Request, res: Response) => {
  try {
    const products = await categoryModel.getAllCategoryProducts(req.params.id);
    res.status(201).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error while searching for category products" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const updatedCategoru = await categoryModel.updateCategory(
      req.params.id,
      req.body
    );
    res.status(201).json({ message: "Category updated succesfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error while updating category: ${error}` });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await categoryModel.deleteCategory(req.params.id);
    res.status(201).json({ message: "Category deleted succesfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error while deleting category: ${error}` });
  }
};
