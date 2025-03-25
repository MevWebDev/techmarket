import * as reviewModel from "../models/reviewModel";
import { Request, Response } from "express";

export const addReview = async (req: Request, res: Response) => {
  try {
    const { rating } = req.body;
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return void res.status(400).json({
        message: "Rating must be an integer between 1 and 5",
      });
    }
    const review = await reviewModel.addReview(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: `Error adding review ${error}` });
  }
};

export const getReviewById = async (req: Request, res: Response) => {
  try {
    const review = await reviewModel.getReviewById(req.params.id);
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: `Error searching review ${error}` });
  }
};

export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await reviewModel.getAllReviews();
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: `Error searching reviews ${error}` });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const { rating } = req.body;

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return void res.status(400).json({
        message: "Rating must be an integer between 1 and 5",
      });
    }

    const review = await reviewModel.updateReview(req.params.id, req.body);

    if (!review) {
      return void res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: `Error updating review ${error}` });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const success = await reviewModel.deleteReview(req.params.id);
    if (success) {
      return void res.status(200).json("Review deleted successfully");
    } else {
      return void res.status(404).json("Review not found");
    }
  } catch (error) {
    res.status(500).json({ message: `Error deleting review ${error}` });
  }
};
