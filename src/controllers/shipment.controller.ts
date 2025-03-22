import { Request, Response, NextFunction } from "express";
import { ShipmentService } from "../services/ShipmentService";
import { successResponse } from "../utils/responseHandler";
import {
  CreateShipmentDTO,
  UpdateShipmentDTO,
  ShipmentStatus,
} from "../types/shipment.interface";
import { BadRequestError } from "../utils/errors";

export class ShipmentController {
  private shipmentService: ShipmentService;

  constructor() {
    this.shipmentService = new ShipmentService();
  }

  /**
   * Get all shipments for the authenticated user
   */
  getShipments = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new BadRequestError("User not authenticated");
      }

      const shipments = await this.shipmentService.getShipments(
        req.user.id,
        req.user.role
      );

      successResponse(res, 200, shipments, "Shipments retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a shipment by ID
   */
  getShipmentById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new BadRequestError("User not authenticated");
      }

      const { id } = req.params;

      const shipment = await this.shipmentService.getShipmentById(
        id,
        req.user.id,
        req.user.role
      );

      successResponse(res, 200, shipment, "Shipment retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new shipment
   */
  createShipment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new BadRequestError("User not authenticated");
      }

      const shipmentData: CreateShipmentDTO = req.body;

      // Validate required fields
      if (!shipmentData.origin || !shipmentData.destination) {
        throw new BadRequestError("Origin and destination are required");
      }

      const shipment = await this.shipmentService.createShipment(
        req.user.id,
        req.user.role,
        shipmentData
      );

      successResponse(res, 201, shipment, "Shipment created successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a shipment
   */
  updateShipment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new BadRequestError("User not authenticated");
      }

      const { id } = req.params;
      const shipmentData: UpdateShipmentDTO = req.body;

      const shipment = await this.shipmentService.updateShipment(
        id,
        req.user.id,
        req.user.role,
        shipmentData
      );

      successResponse(res, 200, shipment, "Shipment updated successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a shipment
   */
  deleteShipment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new BadRequestError("User not authenticated");
      }

      const { id } = req.params;

      await this.shipmentService.deleteShipment(id, req.user.id, req.user.role);

      successResponse(res, 200, null, "Shipment deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Submit a shipment for processing
   */
  submitShipment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new BadRequestError("User not authenticated");
      }

      const { id } = req.params;

      const shipment = await this.shipmentService.submitShipment(
        id,
        req.user.id,
        req.user.role
      );

      successResponse(res, 200, shipment, "Shipment submitted successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Assign a forwarder to a shipment (admin only)
   */
  assignForwarder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new BadRequestError("User not authenticated");
      }

      const { id } = req.params;
      const { forwarderId } = req.body;

      if (!forwarderId) {
        throw new BadRequestError("Forwarder ID is required");
      }

      const shipment = await this.shipmentService.assignForwarder(
        id,
        forwarderId,
        req.user.id,
        req.user.role
      );

      successResponse(res, 200, shipment, "Forwarder assigned successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update shipment status
   */
  updateStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new BadRequestError("User not authenticated");
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new BadRequestError("Status is required");
      }

      // Validate status
      const validStatuses: ShipmentStatus[] = [
        "draft",
        "submitted",
        "confirmed",
        "in_progress",
        "delivered",
        "cancelled",
      ];

      if (!validStatuses.includes(status as ShipmentStatus)) {
        throw new BadRequestError("Invalid status value");
      }

      const shipment = await this.shipmentService.updateStatus(
        id,
        status as ShipmentStatus,
        req.user.id,
        req.user.role
      );

      successResponse(
        res,
        200,
        shipment,
        "Shipment status updated successfully"
      );
    } catch (error) {
      next(error);
    }
  };
}
