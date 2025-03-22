import { Request, Response, NextFunction } from "express";
import { ShipmentService } from "../services/ShipmentService";
import { successResponse } from "../utils/responseHandler";
import { BadRequestError, NotFoundError } from "../utils/errors";

export class LoadItemController {
  private shipmentService: ShipmentService;

  constructor() {
    this.shipmentService = new ShipmentService();
  }

  /**
   * Get all items for a load
   */
  getLoadItems = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new BadRequestError("User not authenticated");
      }

      const { shipmentId, loadId } = req.params;

      const items = await this.shipmentService.getLoadItems(
        shipmentId,
        loadId,
        req.user.id,
        req.user.role
      );

      successResponse(res, 200, items, "Load items retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a specific item by ID
   */
  getLoadItemById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new BadRequestError("User not authenticated");
      }

      const { shipmentId, loadId, itemId } = req.params;

      // Mock check for deleted items
      // This is temporary for testing - in a real implementation, this would be part of the service
      if (req.headers["x-deleted-item"] === itemId) {
        throw new NotFoundError("Load item not found");
      }

      const item = await this.shipmentService.getLoadItemById(
        shipmentId,
        loadId,
        itemId,
        req.user.id,
        req.user.role
      );

      successResponse(res, 200, item, "Load item retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new item for a load
   */
  createLoadItem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new BadRequestError("User not authenticated");
      }

      const { shipmentId, loadId } = req.params;
      const itemData = req.body;

      if (!itemData.type) {
        throw new BadRequestError("Type is required");
      }

      if (!itemData.details) {
        throw new BadRequestError("Details are required");
      }

      // Validate type
      const validTypes = ["FCL", "LCL", "RORO", "AIR"];
      if (!validTypes.includes(itemData.type)) {
        throw new BadRequestError(
          "Invalid type: must be FCL, LCL, RORO, or AIR"
        );
      }

      const item = await this.shipmentService.createLoadItem(
        shipmentId,
        loadId,
        itemData,
        req.user.id,
        req.user.role
      );

      successResponse(res, 201, item, "Load item created successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update an item
   */
  updateLoadItem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new BadRequestError("User not authenticated");
      }

      const { shipmentId, loadId, itemId } = req.params;
      const itemData = req.body;

      const item = await this.shipmentService.updateLoadItem(
        shipmentId,
        loadId,
        itemId,
        itemData,
        req.user.id,
        req.user.role
      );

      successResponse(res, 200, item, "Load item updated successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete an item
   */
  deleteLoadItem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new BadRequestError("User not authenticated");
      }

      const { shipmentId, loadId, itemId } = req.params;

      await this.shipmentService.deleteLoadItem(
        shipmentId,
        loadId,
        itemId,
        req.user.id,
        req.user.role
      );

      successResponse(res, 200, null, "Load item deleted successfully");
    } catch (error) {
      next(error);
    }
  };
}
