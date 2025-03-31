import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import productRoutes from "./src/routes/productRoutes";
import categoryRoutes from "./src/routes/categoryRoutes";
import userRoutes from "./src/routes/userRoutes";
import reviewRoutes from "./src/routes/reviewRoutes";
import cartRoutes from "./src/routes/cartRoutes";
import { errorHandler } from "./src/middleware/errorHandler";

import connectMongo from "./src/config/mongodb";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/cart", cartRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
