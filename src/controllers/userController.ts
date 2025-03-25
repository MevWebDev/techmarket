import * as userModel from "../models/userModel";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userModel.createUser({
      username,
      email,
      passwordHash,
      firstName,
      lastName,
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: `Error while creating user\n ${error}` });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userModel.getUserById(req.params.id);
    res.status(201).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error while fetching user by id\n ${error}` });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userModel.getAllUsers();
    res.status(201).json(users);
  } catch (error) {
    res.status(500).json({ message: `Error while fetching users\n ${error}` });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const updateData: any = {};

    if (req.body.username !== undefined)
      updateData.username = req.body.username;
    if (req.body.email !== undefined) updateData.email = req.body.email;
    if (req.body.firstName !== undefined)
      updateData.firstName = req.body.firstName;
    if (req.body.lastName !== undefined)
      updateData.lastName = req.body.lastName;

    if (req.body.password) {
      updateData.passwordHash = await bcrypt.hash(req.body.password, 10);
    }

    if (Object.keys(updateData).length > 0) {
      const updatedUser = await userModel.updateUser(req.params.id, updateData);
      res.json(updatedUser);
    } else {
      res.status(400).json({ message: "No fields to update" });
    }
  } catch (error) {
    res.status(500).json({ message: `Error while updating user\n ${error}` });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await userModel.deleteUser(req.params.id);

    if (!user) {
      return void res.status(404).json({ message: "User not found" });
    }

    // Return success but don't include sensitive user information in response
    res.status(200).json({
      message: "User deleted successfully",
      id: user.id,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: `Error while deleting user\n ${error}` });
  }
};
