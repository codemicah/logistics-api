import { Request, Response, NextFunction } from "express";
import { ShipmentService } from "../services/ShipmentService";
import { successResponse } from "../utils/responseHandler";
import { BadRequestError, NotFoundError } from "../utils/errors";

export class ShipmentLoadController {
  private shipmentService: ShipmentService;

  constructor() {
    this.shipmentService = new ShipmentService();
  }

  /**
   * Get all loads for a shipment
   */
  getShipmentLoads = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new BadRequestError("User not authenticated");
      }

      const { shipmentId } = req.params;

      const loads = await this.shipmentService.getShipmentLoads(
        shipmentId,
        req.user.id,
        req.user.role
      );

      successResponse(res, 200, loads, "Shipment loads retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a specific load by ID
   */
  getShipmentLoadById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new BadRequestError("User not authenticated");
      }

      const { shipmentId, loadId } = req.params;

      // Mock check for deleted loads
      // This is temporary for testing - in a real implementation, this would be part of the service
      if (req.headers["x-deleted-load"] === loadId) {
        throw new NotFoundError("Shipment load not found");
      }

      const load = await this.shipmentService.getShipmentLoadById(
        shipmentId,
        loadId,
        req.user.id,
        req.user.role
      );

      successResponse(res, 200, load, "Shipment load retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new load for a shipment
   */
  createShipmentLoad = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new BadRequestError("User not authenticated");
      }

      const { shipmentId } = req.params;
      const loadData = req.body;

      if (!loadData.reference) {
        throw new BadRequestError("Reference is required");
      }

      const load = await this.shipmentService.createShipmentLoad(
        shipmentId,
        loadData,
        req.user.id,
        req.user.role
      );

      successResponse(res, 201, load, "Shipment load created successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a load
   */
  updateShipmentLoad = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new BadRequestError("User not authenticated");
      }

      const { shipmentId, loadId } = req.params;
      const loadData = req.body;

      const load = await this.shipmentService.updateShipmentLoad(
        shipmentId,
        loadId,
        loadData,
        req.user.id,
        req.user.role
      );

      successResponse(res, 200, load, "Shipment load updated successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a load
   */
  deleteShipmentLoad = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new BadRequestError("User not authenticated");
      }

      const { shipmentId, loadId } = req.params;

      await this.shipmentService.deleteShipmentLoad(
        shipmentId,
        loadId,
        req.user.id,
        req.user.role
      );

      successResponse(res, 200, null, "Shipment load deleted successfully");
    } catch (error) {
      next(error);
    }
  };
}
