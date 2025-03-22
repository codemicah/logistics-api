import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";
import { successResponse } from "../utils/responseHandler";
import { ILoginRequest, IRegisterRequest } from "../types/user.interface";
import { BadRequestError } from "../utils/errors";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   */
  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userData: IRegisterRequest = req.body;

      // Validate required fields
      if (!userData.email || !userData.password || !userData.role) {
        throw new BadRequestError("Missing required fields");
      }

      if (
        !userData.profile ||
        !userData.profile.name ||
        !userData.profile.company ||
        !userData.profile.contactNumber
      ) {
        throw new BadRequestError("Missing profile information");
      }

      const result = await this.authService.register(userData);

      successResponse(res, 201, result, "User registered successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login a user
   */
  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const credentials: ILoginRequest = req.body;

      // Validate required fields
      if (!credentials.email || !credentials.password) {
        throw new BadRequestError("Email and password are required");
      }

      const result = await this.authService.login(credentials);

      successResponse(res, 200, result, "Login successful");
    } catch (error) {
      next(error);
    }
  };
}
