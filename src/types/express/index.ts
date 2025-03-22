// Extending Express request interface
export {}; // Making this file a module

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
      platform?: string;
    }
  }
}
