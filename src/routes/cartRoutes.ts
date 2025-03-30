import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController";

const router = express.Router();

router.get("/:userId", getCart);

router.post("/", addToCart);

router.put("/", updateCartItem);

router.delete("/:userId/items/:productId", removeFromCart);

router.delete("/:userId", clearCart);

export default router;
