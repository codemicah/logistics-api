import { NotFoundError } from "../utils/errors";
import Shipment from "../models/shipment";
import {
  IShipment,
  CreateShipmentDTO,
  UpdateShipmentDTO,
} from "../types/shipment.interface";

export class ShipmentRepository {
  /**
   * Find all shipments that match the filter
   */
  async findAll(filter: object = {}): Promise<IShipment[]> {
    return Shipment.find(filter).sort({ createdAt: -1 });
  }

  /**
   * Find a shipment by ID
   */
  async findById(id: string): Promise<IShipment> {
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      throw new NotFoundError(`Shipment with ID ${id} not found`);
    }
    return shipment;
  }

  /**
   * Create a new shipment
   */
  async create(
    shipperId: string,
    shipmentData: CreateShipmentDTO
  ): Promise<IShipment> {
    const shipment = new Shipment({
      ...shipmentData,
      shipperId,
      status: "draft",
    });

    return shipment.save();
  }

  /**
   * Update a shipment
   */
  async update(
    id: string,
    shipmentData: UpdateShipmentDTO
  ): Promise<IShipment> {
    const shipment = await Shipment.findByIdAndUpdate(
      id,
      { $set: shipmentData },
      { new: true }
    );

    if (!shipment) {
      throw new NotFoundError(`Shipment with ID ${id} not found`);
    }

    return shipment;
  }

  /**
   * Delete a shipment
   */
  async delete(id: string): Promise<boolean> {
    const result = await Shipment.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundError(`Shipment with ID ${id} not found`);
    }

    return true;
  }

  /**
   * Find shipments for a user based on their role
   */
  async findByUserRole(userId: string, role: string): Promise<IShipment[]> {
    let filter = {};

    if (role === "shipper") {
      filter = { shipperId: userId };
    } else if (role === "forwarder") {
      filter = { forwarderId: userId };
    }
    // admin can see all shipments, so no filter is needed

    return this.findAll(filter);
  }
}
