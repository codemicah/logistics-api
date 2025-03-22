import { Request, Response, NextFunction } from "express";

/**
 * Middleware to detect the platform from the request headers
 * Sets the platform property on the request object
 */
export const platformDetection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const platform = req.headers["x-platform"] as string;

  // Default to web if not specified
  req.platform = platform || "web";

  // We could also validate if the platform is one of the allowed platforms
  const allowedPlatforms = ["web", "mobile", "admin", "public"];

  if (!allowedPlatforms.includes(req.platform)) {
    req.platform = "web"; // Fallback to web if platform is not allowed
  }

  next();
};
