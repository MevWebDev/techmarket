import prisma from "../config/db";
import { Prisma, Review } from "@prisma/client";

export const addReview = async (
  review: Omit<Review, "id" | "createdAt" | "updatedAt">
) => {
  const { productId, userId, rating, comment } = review;

  return await prisma.review.create({
    data: {
      productId,
      userId,
      rating,
      comment,
    },
  });
};

export const getReviewById = async (id: string) => {
  const reviewId = parseInt(id);
  return await prisma.review.findUnique({
    where: { id: reviewId },
    include: { user: true, product: true },
  });
};

export const getAllReviews = async () => {
  return await prisma.review.findMany({
    include: {
      user: true,
      product: true,
    },
  });
};

export const updateReview = async (id: string, reviewData: Partial<Review>) => {
  const reviewId = parseInt(id);
  if (isNaN(reviewId)) {
    throw new Error("Invalid product ID format");
  }

  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!existingReview) {
    return null;
  }

  const { rating, comment } = reviewData;

  return await prisma.review.update({
    where: { id: reviewId },
    data: { rating, comment },
  });
};

export const deleteReview = async (id: string) => {
  const reviewId = parseInt(id);

  const review = prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) return null;

  return await prisma.review.delete({
    where: { id: reviewId },
  });
};
