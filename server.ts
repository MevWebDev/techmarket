import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import productRoutes from "./src/routes/productRoutes";
import { errorHandler } from "./src/middleware/errorHandler";
import { requestLogger } from "./src/middleware/logger";
import { initializeDb } from "./src/config/initDb";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

initializeDb();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/products", productRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
