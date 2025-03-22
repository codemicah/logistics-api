import { NotFoundError } from "../utils/errors";
import ShipmentLoad from "../models/shipmentLoad";
import { IShipmentLoad, TransportMode } from "../types/shipment.interface";

interface CreateShipmentLoadDTO {
  transportMode: TransportMode;
  pickupAddress: string;
  deliveryAddress: string;
  pickupDate?: Date;
  deliveryDate?: Date;
}

interface UpdateShipmentLoadDTO {
  transportMode?: TransportMode;
  status?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  pickupDate?: Date;
  deliveryDate?: Date;
}

export class ShipmentLoadRepository {
  /**
   * Find all loads for a shipment
   */
  async findByShipmentId(shipmentId: string): Promise<IShipmentLoad[]> {
    return ShipmentLoad.find({ shipmentId }).sort({ createdAt: -1 });
  }

  /**
   * Find a load by ID
   */
  async findById(id: string): Promise<IShipmentLoad> {
    const load = await ShipmentLoad.findById(id);

    if (!load) {
      throw new NotFoundError(`Shipment Load with ID ${id} not found`);
    }

    return load;
  }

  /**
   * Create a new shipment load
   */
  async create(
    shipmentId: string,
    loadData: CreateShipmentLoadDTO
  ): Promise<IShipmentLoad> {
    const load = new ShipmentLoad({
      ...loadData,
      shipmentId,
      status: "pending",
    });

    return load.save();
  }

  /**
   * Update a shipment load
   */
  async update(
    id: string,
    loadData: UpdateShipmentLoadDTO
  ): Promise<IShipmentLoad> {
    const load = await ShipmentLoad.findByIdAndUpdate(
      id,
      { $set: loadData },
      { new: true }
    );

    if (!load) {
      throw new NotFoundError(`Shipment Load with ID ${id} not found`);
    }

    return load;
  }

  /**
   * Delete a shipment load
   */
  async delete(id: string): Promise<boolean> {
    const result = await ShipmentLoad.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundError(`Shipment Load with ID ${id} not found`);
    }

    return true;
  }
}
