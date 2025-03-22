import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/responseHandler";

/**
 * Middleware to check if the user has the required role(s)
 * @param roles Array of allowed roles
 */
export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      errorResponse(res, 401, "Authentication required");
      return;
    }

    if (!roles.includes(req.user.role)) {
      errorResponse(
        res,
        403,
        "You do not have permission to perform this action"
      );
      return;
    }

    next();
  };
};
