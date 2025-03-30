import { Request, Response } from "express";
import Cart from "../models/cartModel";
import * as productModel from "../models/productModel";

const fetchCartData = async (userId: string) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) return { userId, items: [] };

  // Fetch full product details for each item in the cart
  const cartWithProducts = await Promise.all(
    cart.items.map(async (item) => {
      const product = await productModel.getProductById(String(item.productId));
      return {
        productId: item.productId,
        quantity: item.quantity,
        product: product || {
          name: "Product no longer available",
          price: 0,
          imageUrl: null,
        },
      };
    })
  );

  return {
    userId,
    items: cartWithProducts,
    _id: cart._id,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
};

// Get cart for a user
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const cartData = await fetchCartData(userId);
    res.status(200).json(cartData);
  } catch (error) {
    res.status(500).json({ message: `Error fetching cart: ${error}` });
  }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    if (!userId || !productId) {
      return void res
        .status(400)
        .json({ message: "userId and productId are required" });
    }

    // Verify the product exists in PostgreSQL
    const product = await productModel.getProductById(String(productId));

    if (!product) {
      return void res.status(404).json({ message: "Product not found" });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
      });
    }

    // Check if product already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex > -1) {
      // Update quantity if product already exists
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item with only productId and quantity
      cart.items.push({
        productId,
        quantity,
      });
    }

    await cart.save();

    // Use fetchCartData instead of calling getCart
    const cartData = await fetchCartData(userId);
    res.status(201).json(cartData);
  } catch (error) {
    res.status(500).json({ message: `Error adding to cart: ${error}` });
  }
};

// Update item quantity
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity === undefined) {
      return void res
        .status(400)
        .json({ message: "userId, productId and quantity are required" });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return void res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex === -1) {
      res.status(404).json({ message: "Product not found in cart" });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    // Use fetchCartData instead of modifying req.params and calling getCart
    const cartData = await fetchCartData(userId);
    res.status(200).json(cartData);
  } catch (error) {
    res.status(500).json({ message: `Error updating cart: ${error}` });
  }
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const productId = Number(req.params.productId);

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return void res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (itemIndex === -1) {
      return void res
        .status(404)
        .json({ message: "Product not found in cart" });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    // Use fetchCartData instead of calling getCart
    const cartData = await fetchCartData(userId);
    res.status(200).json(cartData);
  } catch (error) {
    res.status(500).json({ message: `Error removing from cart: ${error}` });
  }
};

// Clear cart
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return void res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res
      .status(200)
      .json({ message: "Cart cleared successfully", userId, items: [] });
  } catch (error) {
    res.status(500).json({ message: `Error clearing cart: ${error}` });
  }
};
