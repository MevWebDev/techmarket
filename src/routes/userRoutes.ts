import express from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/userController";

const router = express.Router();

router.post("/", createUser);
router.get("/:id", getUserById);
router.get("/", getAllUsers);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
