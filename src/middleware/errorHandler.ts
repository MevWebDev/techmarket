import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err.message);

  // Send a generic error response
  res.status(500).json({
    message: err.message || "Internal server error",
  });
};
