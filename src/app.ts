import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
// Import Swagger UI with require to avoid TypeScript errors
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../docs/api/swagger.json");
import { errorHandler } from "./middlewares/errorHandler";
import { platformDetection } from "./middlewares/platformDetection";
import { NotFoundError } from "./utils/errors";

// Import routes
import authRoutes from "./routes/auth.routes";
import shipmentRoutes from "./routes/shipment.routes";
import shipmentLoadRoutes from "./routes/shipmentLoad.routes";
import loadItemRoutes from "./routes/loadItem.routes";

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Platform detection
app.use(platformDetection);

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.get("/test", (_req: Request, res: Response) => {
  return res.status(200).json({ message: "API is working" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/shipments/:shipmentId/loads", shipmentLoadRoutes);
app.use("/api/shipments/:shipmentId/loads/:loadId/items", loadItemRoutes);

// 404 handler
app.use("*", (req: Request, _res: Response, next: NextFunction) => {
  const path = req.originalUrl;
  const method = req.method;
  next(
    new NotFoundError(`The method ${method} is not defined on path ${path}`)
  );
});

// Error handler
app.use(errorHandler);

export default app;
