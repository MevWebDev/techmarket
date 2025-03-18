import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getAllCategoryProducts,
  getCategoryById,
  updateCategory,
} from "../controllers/categoryControllers";

const router = express.Router();

router.post("/", createCategory);
router.get("/:id", getCategoryById);
router.get("/", getAllCategories);
router.get("/:id/products", getAllCategoryProducts);
router.patch("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
