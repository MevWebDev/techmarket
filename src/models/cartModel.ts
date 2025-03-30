import mongoose, { Schema, Document } from "mongoose";

interface CartItem {
  productId: number;
  quantity: number;
}

export interface ICart extends Document {
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    userId: { type: String, required: true, index: true },
    items: [
      {
        productId: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

// Add a TTL index that expires carts after 7 days of inactivity
CartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

export const Cart = mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
