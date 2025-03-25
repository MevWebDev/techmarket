import prisma from "../config/db";
import { Prisma, User } from "@prisma/client";

export const createUser = async (
  user: Omit<User, "id" | "createdAt" | "updatedAt">
) => {
  const { username, email, passwordHash, firstName, lastName } = user;
  return await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      firstName,
      lastName,
    },
  });
};

export const getUserById = async (id: string) => {
  const userId = parseInt(id);
  return await prisma.user.findUnique({
    where: { id: userId },
    include: { reviews: true },
  });
};

export const getAllUsers = async () => {
  return await prisma.user.findMany({});
};

export const updateUser = async (id: string, user: Partial<User>) => {
  const userId = parseInt(id);
  return await prisma.user.update({
    where: { id: userId },
    data: {
      ...user,
    },
  });
};

export const deleteUser = async (id: string) => {
  const userId = parseInt(id);

  if (isNaN(userId)) {
    throw new Error("Invalid user ID format");
  }

  // Optional: First check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    return null;
  }

  // Delete all user's reviews first to avoid foreign key constraints
  await prisma.review.deleteMany({
    where: { userId },
  });

  // Now delete the user
  return await prisma.user.delete({
    where: { id: userId },
  });
};
