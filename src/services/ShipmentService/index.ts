import { ShipmentRepository } from "../../repositories/shipment.repository";
import { ShipmentLoadRepository } from "../../repositories/shipmentLoad.repository";
import { LoadItemRepository } from "../../repositories/loadItem.repository";
import {
  IShipment,
  IShipmentLoad,
  ILoadItem,
  CreateShipmentDTO,
  UpdateShipmentDTO,
  ShipmentStatus,
  TransportMode,
} from "../../types/shipment.interface";
import {
  ForbiddenError,
  NotFoundError,
  BadRequestError,
  AppError,
} from "../../utils/errors";

// Define the DTO types to match what's in the repository
interface CreateShipmentLoadDTO {
  loadNumber: string;
  reference: string;
  transportMode: TransportMode;
  pickupAddress: string;
  deliveryAddress: string;
  pickupDate?: Date;
  deliveryDate?: Date;
}

interface ShipmentLoadData {
  transportMode?: TransportMode;
  status?: string;
  containerNumber?: string;
  containerSize?: string;
  containerType?: string;
  weight?: number;
  description?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  pickupDate?: Date;
  deliveryDate?: Date;
  reference?: string;
}

// Define interfaces for repository dependencies to support testing
interface IShipmentRepository {
  create(shipperId: string, shipmentData: any): Promise<IShipment>;
  findById(id: string): Promise<IShipment>;
  findAll(filter?: object): Promise<IShipment[]>;
  update(id: string, data: any): Promise<IShipment>;
  delete(id: string): Promise<boolean>;
  findByUserRole(userId: string, role: string): Promise<IShipment[]>;
}

interface IShipmentLoadRepository {
  create(shipmentId: string, loadData: any): Promise<IShipmentLoad>;
  findById(id: string): Promise<IShipmentLoad>;
  findByShipmentId(shipmentId: string): Promise<IShipmentLoad[]>;
  update(id: string, data: any): Promise<IShipmentLoad>;
  delete(id: string): Promise<boolean>;
}

interface ILoadItemRepository {
  create(shipmentLoadId: string, itemData: any): Promise<ILoadItem>;
  findById(id: string): Promise<ILoadItem>;
  findByShipmentLoadId(loadId: string): Promise<ILoadItem[]>;
  update(id: string, data: any): Promise<ILoadItem>;
  delete(id: string): Promise<boolean>;
}

export class ShipmentService {
  private shipmentRepository: IShipmentRepository;
  private shipmentLoadRepository: IShipmentLoadRepository;
  private loadItemRepository: ILoadItemRepository;

  constructor(
    shipmentRepository?: IShipmentRepository,
    shipmentLoadRepository?: IShipmentLoadRepository,
    loadItemRepository?: ILoadItemRepository
  ) {
    // Use provided repositories or default to real implementations
    this.shipmentRepository = shipmentRepository || new ShipmentRepository();
    this.shipmentLoadRepository =
      shipmentLoadRepository || new ShipmentLoadRepository();
    this.loadItemRepository = loadItemRepository || new LoadItemRepository();
  }

  /**
   * Get shipments for a user based on their role
   */
  async getShipments(userId: string, role: string): Promise<IShipment[]> {
    return this.shipmentRepository.findByUserRole(userId, role);
  }

  /**
   * Get a shipment by ID with permission check
   */
  async getShipmentById(
    id: string,
    userId: string,
    role: string
  ): Promise<IShipment> {
    const shipment = await this.shipmentRepository.findById(id);

    // Check if user has permission to view this shipment
    if (
      role !== "admin" &&
      ((role === "shipper" && shipment.shipperId.toString() !== userId) ||
        (role === "forwarder" && shipment.forwarderId?.toString() !== userId))
    ) {
      throw new ForbiddenError(
        "You do not have permission to view this shipment"
      );
    }

    return shipment;
  }

  /**
   * Create a new shipment
   */
  async createShipment(
    userId: string,
    role: string,
    shipmentData: CreateShipmentDTO
  ): Promise<IShipment> {
    // Only shippers and admins can create shipments
    if (role !== "shipper" && role !== "admin") {
      throw new ForbiddenError("Only shippers and admins can create shipments");
    }

    return this.shipmentRepository.create(userId, shipmentData);
  }

  /**
   * Update a shipment with permission check
   */
  async updateShipment(
    id: string,
    userId: string,
    role: string,
    shipmentData: UpdateShipmentDTO
  ): Promise<IShipment> {
    const shipment = await this.shipmentRepository.findById(id);

    // Check if user has permission to update this shipment
    if (role !== "admin") {
      if (role === "shipper" && shipment.shipperId.toString() !== userId) {
        throw new ForbiddenError(
          "You do not have permission to update this shipment"
        );
      }

      if (role === "forwarder" && shipment.forwarderId?.toString() !== userId) {
        throw new ForbiddenError(
          "You do not have permission to update this shipment"
        );
      }

      // Shippers can only update draft shipments
      if (role === "shipper" && shipment.status !== "draft") {
        throw new ForbiddenError("Shippers can only update draft shipments");
      }
    }

    return this.shipmentRepository.update(id, shipmentData);
  }

  /**
   * Delete a shipment with permission check
   */
  async deleteShipment(
    id: string,
    userId: string,
    role: string
  ): Promise<boolean> {
    const shipment = await this.shipmentRepository.findById(id);

    // Only admins and the shipper who created the shipment can delete it
    if (
      role !== "admin" &&
      (role !== "shipper" || shipment.shipperId.toString() !== userId)
    ) {
      throw new ForbiddenError(
        "You do not have permission to delete this shipment"
      );
    }

    // Shipments can only be deleted if they are in draft status
    if (shipment.status !== "draft") {
      throw new ForbiddenError("Only draft shipments can be deleted");
    }

    return this.shipmentRepository.delete(id);
  }

  /**
   * Assign a forwarder to a shipment (admin only)
   */
  async assignForwarder(
    shipmentId: string,
    forwarderId: string,
    userId: string,
    role: string
  ): Promise<IShipment> {
    // Only admins can assign forwarders
    if (role !== "admin") {
      throw new ForbiddenError("Only admins can assign forwarders");
    }

    const shipment = await this.shipmentRepository.findById(shipmentId);

    // Update the shipment with the forwarder ID
    return this.shipmentRepository.update(shipmentId, {
      forwarderId,
      status: "submitted" as ShipmentStatus,
    });
  }

  /**
   * Submit a shipment for processing (change status from draft to submitted)
   */
  async submitShipment(
    shipmentId: string,
    userId: string,
    role: string
  ): Promise<IShipment> {
    const shipment = await this.shipmentRepository.findById(shipmentId);

    // Only the shipper who created the shipment or admin can submit it
    if (
      role !== "admin" &&
      (role !== "shipper" || shipment.shipperId.toString() !== userId)
    ) {
      throw new ForbiddenError(
        "You do not have permission to submit this shipment"
      );
    }

    // Shipment must be in draft status to be submitted
    if (shipment.status !== "draft") {
      throw new ForbiddenError("Only draft shipments can be submitted");
    }

    // Update the shipment status to submitted
    return this.shipmentRepository.update(shipmentId, {
      status: "submitted" as ShipmentStatus,
    });
  }

  /**
   * Update shipment status
   */
  async updateStatus(
    shipmentId: string,
    status: ShipmentStatus,
    userId: string,
    role: string
  ): Promise<IShipment> {
    const shipment = await this.shipmentRepository.findById(shipmentId);

    // Check permissions based on role and status change
    if (role === "shipper" && shipment.shipperId.toString() !== userId) {
      throw new ForbiddenError(
        "You do not have permission to update this shipment"
      );
    }

    if (role === "forwarder" && shipment.forwarderId?.toString() !== userId) {
      throw new ForbiddenError(
        "You do not have permission to update this shipment"
      );
    }

    // Shippers can only change status from draft to submitted
    if (
      role === "shipper" &&
      (shipment.status !== "draft" || status !== "submitted")
    ) {
      throw new ForbiddenError("Shippers can only submit draft shipments");
    }

    // Forwarders can update status from submitted to in_progress or completed
    if (
      role === "forwarder" &&
      (shipment.status === "draft" ||
        (shipment.status === "delivered" && status !== "delivered"))
    ) {
      throw new ForbiddenError(
        "Forwarders can only update submitted or in_progress shipments"
      );
    }

    // Update the shipment status
    return this.shipmentRepository.update(shipmentId, { status });
  }

  // ShipmentLoad Methods

  /**
   * Get all loads for a shipment
   */
  async getShipmentLoads(
    shipmentId: string,
    userId: string,
    role: string
  ): Promise<IShipmentLoad[]> {
    // Verify shipment exists before returning loads
    await this.getShipmentById(shipmentId, userId, role);

    // Use repository to fetch data
    return this.shipmentLoadRepository.findByShipmentId(shipmentId);
  }

  /**
   * Get a specific load by ID
   */
  async getShipmentLoadById(
    shipmentId: string,
    loadId: string,
    userId: string,
    role: string
  ): Promise<IShipmentLoad> {
    // Verify shipment exists
    await this.getShipmentById(shipmentId, userId, role);

    // Find the load
    const load = await this.shipmentLoadRepository.findById(loadId);

    // Verify load belongs to shipment
    if (load.shipmentId.toString() !== shipmentId) {
      throw new ForbiddenError(
        "This load does not belong to the specified shipment"
      );
    }

    return load;
  }

  /**
   * Create a new load for a shipment
   */
  async createShipmentLoad(
    shipmentId: string,
    loadData: ShipmentLoadData,
    userId: string,
    role: string
  ): Promise<IShipmentLoad> {
    try {
      // Verify the shipment exists
      const shipment = await this.getShipmentById(shipmentId, userId, role);

      // Generate a load number
      let loadNumber = `${shipment.shipmentNumber}-L01`;
      try {
        const loads = await this.shipmentLoadRepository.findByShipmentId(
          shipmentId
        );
        const count = loads.length;
        loadNumber = `${shipment.shipmentNumber}-L${(count + 1)
          .toString()
          .padStart(2, "0")}`;
      } catch (error) {
        // If no loads exist, use default
      }

      // Prepare the data for creating the load that matches the required DTO
      const createLoadData: CreateShipmentLoadDTO = {
        loadNumber,
        reference: loadData.reference!,
        transportMode: loadData.transportMode || "FCL",
        pickupAddress: loadData.pickupAddress || shipment.origin,
        deliveryAddress: loadData.deliveryAddress || shipment.destination,
        pickupDate: loadData.pickupDate,
        deliveryDate: loadData.deliveryDate,
      };

      // Create the load
      const load = await this.shipmentLoadRepository.create(
        shipmentId,
        createLoadData
      );

      // If there are additional properties that need to be updated after creation
      if (
        loadData.containerNumber ||
        loadData.containerSize ||
        loadData.containerType ||
        loadData.weight ||
        loadData.description ||
        loadData.reference ||
        loadData.status
      ) {
        const additionalData = {
          containerNumber: loadData.containerNumber,
          containerSize: loadData.containerSize,
          containerType: loadData.containerType,
          weight: loadData.weight,
          description: loadData.description,
          reference: loadData.reference,
          status: loadData.status || "pending",
        };

        // Update with additional data
        return this.shipmentLoadRepository.update(
          (load as any)._id.toString(),
          additionalData
        );
      }

      return load;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to create shipment load", 500);
    }
  }

  /**
   * Update a load
   */
  async updateShipmentLoad(
    shipmentId: string,
    loadId: string,
    loadData: any,
    userId: string,
    role: string
  ): Promise<IShipmentLoad> {
    // Verify shipment exists
    await this.getShipmentById(shipmentId, userId, role);

    // Find the load to verify it exists
    const load = await this.shipmentLoadRepository.findById(loadId);

    // Verify load belongs to shipment
    if (load.shipmentId.toString() !== shipmentId) {
      throw new ForbiddenError(
        "This load does not belong to the specified shipment"
      );
    }

    // Update the load
    return this.shipmentLoadRepository.update(loadId, loadData);
  }

  /**
   * Delete a load
   */
  async deleteShipmentLoad(
    shipmentId: string,
    loadId: string,
    userId: string,
    role: string
  ): Promise<void> {
    // Verify shipment exists
    await this.getShipmentById(shipmentId, userId, role);

    // Find the load to verify it exists
    const load = await this.shipmentLoadRepository.findById(loadId);

    // Verify load belongs to shipment
    if (load.shipmentId.toString() !== shipmentId) {
      throw new ForbiddenError(
        "This load does not belong to the specified shipment"
      );
    }

    // Delete the load
    await this.shipmentLoadRepository.delete(loadId);
  }

  // LoadItem Methods

  /**
   * Get all items for a load
   */
  async getLoadItems(
    shipmentId: string,
    loadId: string,
    userId: string,
    role: string
  ): Promise<ILoadItem[]> {
    // Verify shipment exists
    await this.getShipmentById(shipmentId, userId, role);

    // Verify load exists and belongs to shipment
    await this.getShipmentLoadById(shipmentId, loadId, userId, role);

    // Get items using repository
    return this.loadItemRepository.findByShipmentLoadId(loadId);
  }

  /**
   * Get a specific item by ID
   */
  async getLoadItemById(
    shipmentId: string,
    loadId: string,
    itemId: string,
    userId: string,
    role: string
  ): Promise<ILoadItem> {
    // Verify shipment exists
    await this.getShipmentById(shipmentId, userId, role);

    // Verify load exists and belongs to shipment
    await this.getShipmentLoadById(shipmentId, loadId, userId, role);

    // Get item and verify it exists
    const item = await this.loadItemRepository.findById(itemId);

    // Verify item belongs to load
    if (item.shipmentLoadId.toString() !== loadId) {
      throw new ForbiddenError(
        "This item does not belong to the specified load"
      );
    }

    return item;
  }

  /**
   * Create a new item for a load
   */
  async createLoadItem(
    shipmentId: string,
    loadId: string,
    itemData: any,
    userId: string,
    role: string
  ): Promise<ILoadItem> {
    try {
      // Verify shipment and load exist
      await this.getShipmentById(shipmentId, userId, role);
      const load = await this.getShipmentLoadById(
        shipmentId,
        loadId,
        userId,
        role
      );

      // Determine the correct DTO structure based on transport mode
      const transportMode = load.transportMode || "FCL";
      let loadItemDTO: any = {
        description: itemData.description,
        dangerousGoods: itemData.hazardous || false,
        specialInstructions: itemData.specialInstructions,
        type: transportMode, // Ensure type matches transport mode
      };

      // Based on transport mode, add specific fields
      switch (transportMode) {
        case "FCL":
          loadItemDTO.specifications = {
            containerSize: itemData.containerSize || "40ft",
            containerType: itemData.containerType || "Standard",
          };
          break;
        case "LCL":
          loadItemDTO.specifications = {
            weight: itemData.weight || 0,
            cbm: itemData.volume || 0,
          };
          break;
        case "RORO":
          loadItemDTO.specifications = {
            quantity: itemData.quantity || 1,
            unitType: itemData.unitType || "Vehicle",
          };
          break;
        case "AIR":
          loadItemDTO.specifications = {
            weight: itemData.weight || 0,
            cbm: itemData.volume || 0,
          };
          break;
      }

      return this.loadItemRepository.create(loadId, loadItemDTO);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to create load item", 500);
    }
  }

  /**
   * Update an item
   */
  async updateLoadItem(
    shipmentId: string,
    loadId: string,
    itemId: string,
    itemData: any,
    userId: string,
    role: string
  ): Promise<ILoadItem> {
    // Verify shipment exists
    await this.getShipmentById(shipmentId, userId, role);

    // Verify load exists and belongs to shipment
    await this.getShipmentLoadById(shipmentId, loadId, userId, role);

    // Get item to verify it exists
    const item = await this.loadItemRepository.findById(itemId);

    // Verify item belongs to load
    if (item.shipmentLoadId.toString() !== loadId) {
      throw new ForbiddenError(
        "This item does not belong to the specified load"
      );
    }

    // Adapt item data to fit the LoadItem model structure
    const adaptedItemData = {
      description: itemData.description,
      dangerousGoods: itemData.dangerousGoods,
      specialInstructions: itemData.specialInstructions,
      // Don't update the type or specifications directly - would need special handling
    };

    // Update item using repository
    return this.loadItemRepository.update(itemId, adaptedItemData);
  }

  /**
   * Delete an item
   */
  async deleteLoadItem(
    shipmentId: string,
    loadId: string,
    itemId: string,
    userId: string,
    role: string
  ): Promise<void> {
    // Verify shipment exists
    await this.getShipmentById(shipmentId, userId, role);

    // Verify load exists and belongs to shipment
    await this.getShipmentLoadById(shipmentId, loadId, userId, role);

    // Get item to verify it exists
    const item = await this.loadItemRepository.findById(itemId);

    // Verify item belongs to load
    if (item.shipmentLoadId.toString() !== loadId) {
      throw new ForbiddenError(
        "This item does not belong to the specified load"
      );
    }

    // Delete item using repository
    await this.loadItemRepository.delete(itemId);
  }
}
