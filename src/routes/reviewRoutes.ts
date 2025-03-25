import express from "express";
import {
  addReview,
  getReviewById,
  getAllReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController";

const router = express.Router();

router.post("/", addReview);
router.get("/:id", getReviewById);
router.get("/", getAllReviews);
router.patch("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;
