import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err.message); // Log the error

  // Send a generic error response
  res.status(500).json({
    message: "Something went wrong on the server.",
    error: err.message,
  });
};
