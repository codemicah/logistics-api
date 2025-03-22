import jwt from "jsonwebtoken";
import { config } from "../../config/env";
import User from "../../models/user";
import {
  ILoginRequest,
  IRegisterRequest,
  IUser,
  IUserResponse,
} from "../../types/user.interface";
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "../../utils/errors";
import { hashPassword, comparePassword } from "./utils";
import { Types } from "mongoose";

export class AuthService {
  /**
   * Register a new user
   */
  async register(userData: IRegisterRequest): Promise<IUserResponse> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create new user
    const user = await User.create({
      ...userData,
      password: hashedPassword,
    });

    // Generate JWT
    const token = this.generateToken(user);

    return {
      id: (user._id as Types.ObjectId).toString(),
      email: user.email,
      role: user.role,
      profile: user.profile,
      token,
    };
  }

  /**
   * Login a user
   */
  async login(credentials: ILoginRequest): Promise<IUserResponse> {
    // Find user by email
    const user = await User.findOne({ email: credentials.email });
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Compare password
    const isPasswordValid = await comparePassword(
      credentials.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Generate JWT
    const token = this.generateToken(user);

    return {
      id: (user._id as Types.ObjectId).toString(),
      email: user.email,
      role: user.role,
      profile: user.profile,
      token,
    };
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: IUser): string {
    return jwt.sign(
      {
        id: (user._id as Types.ObjectId).toString(),
        email: user.email,
        role: user.role,
      },
      config.JWT_SECRET,
      { expiresIn: "24h" }
    );
  }
}
