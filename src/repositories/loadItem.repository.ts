import { NotFoundError, BadRequestError } from "../utils/errors";
import LoadItemModel, {
  FCLLoadItem,
  LCLLoadItem,
  ROROLoadItem,
  AirFreightLoadItem,
} from "../models/loadItem";
import { ILoadItem, TransportMode } from "../types/shipment.interface";

// Define DTOs for creating different types of load items
interface BaseLoadItemDTO {
  description: string;
  dangerousGoods: boolean;
  specialInstructions?: string;
}

interface FCLLoadItemDTO extends BaseLoadItemDTO {
  specifications: {
    containerSize: "20ft" | "40ft" | "45ft";
    containerType: string;
  };
}

interface LCLLoadItemDTO extends BaseLoadItemDTO {
  specifications: {
    weight: number;
    cbm: number;
  };
}

interface ROROLoadItemDTO extends BaseLoadItemDTO {
  specifications: {
    quantity: number;
    unitType: string;
  };
}

interface AirFreightLoadItemDTO extends BaseLoadItemDTO {
  specifications: {
    weight: number;
    cbm: number;
  };
}

// Union type for all load item DTOs
type LoadItemDTO =
  | (FCLLoadItemDTO & { type: "FCL" })
  | (LCLLoadItemDTO & { type: "LCL" })
  | (ROROLoadItemDTO & { type: "RORO" })
  | (AirFreightLoadItemDTO & { type: "AIR" });

export class LoadItemRepository {
  /**
   * Find all load items for a shipment load
   */
  async findByShipmentLoadId(shipmentLoadId: string): Promise<ILoadItem[]> {
    return LoadItemModel.find({ shipmentLoadId }).sort({ createdAt: -1 });
  }

  /**
   * Find a load item by ID
   */
  async findById(id: string): Promise<ILoadItem> {
    const loadItem = await LoadItemModel.findById(id);

    if (!loadItem) {
      throw new NotFoundError(`Load Item with ID ${id} not found`);
    }

    return loadItem;
  }

  /**
   * Create a new load item using the factory pattern
   */
  async create(
    shipmentLoadId: string,
    loadItemData: LoadItemDTO
  ): Promise<ILoadItem> {
    const { type, ...data } = loadItemData;

    // Use the factory pattern to create the right type of load item
    switch (type) {
      case "FCL":
        return new FCLLoadItem({
          ...data,
          shipmentLoadId,
        }).save();

      case "LCL":
        return new LCLLoadItem({
          ...data,
          shipmentLoadId,
        }).save();

      case "RORO":
        return new ROROLoadItem({
          ...data,
          shipmentLoadId,
        }).save();

      case "AIR":
        return new AirFreightLoadItem({
          ...data,
          shipmentLoadId,
        }).save();

      default:
        throw new BadRequestError(`Invalid load item type: ${type}`);
    }
  }

  /**
   * Update a load item
   */
  async update(
    id: string,
    loadItemData: Partial<LoadItemDTO>
  ): Promise<ILoadItem> {
    // We can't change the type of a load item, so we remove it from the update
    const { type, ...updateData } = loadItemData;

    const loadItem = await LoadItemModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!loadItem) {
      throw new NotFoundError(`Load Item with ID ${id} not found`);
    }

    return loadItem;
  }

  /**
   * Delete a load item
   */
  async delete(id: string): Promise<boolean> {
    const result = await LoadItemModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundError(`Load Item with ID ${id} not found`);
    }

    return true;
  }
}
