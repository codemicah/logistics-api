import { Document } from "mongoose";

export type ShipmentStatus =
  | "draft"
  | "submitted"
  | "in_progress"
  | "delivered"
  | "cancelled"
  | "confirmed";
export type TransportMode = "FCL" | "LCL" | "RORO" | "AIR";

export interface IShipment extends Document {
  shipmentNumber: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  shipperId: string;
  forwarderId?: string;
  estimatedDeparture?: Date;
  estimatedArrival?: Date;
  actualDeparture?: Date;
  actualArrival?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IShipmentLoad extends Document {
  shipmentId: string;
  loadNumber: string;
  transportMode: TransportMode;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupDate?: Date;
  deliveryDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BaseLoadItem {
  shipmentLoadId: string;
  description: string;
  dangerousGoods: boolean;
  specialInstructions?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFCLLoadItem extends BaseLoadItem, Document {
  type: "FCL";
  specifications: {
    containerSize: "20ft" | "40ft" | "45ft";
    containerType: string;
  };
}

export interface ILCLLoadItem extends BaseLoadItem, Document {
  type: "LCL";
  specifications: {
    weight: number;
    cbm: number;
  };
}

export interface IROROLoadItem extends BaseLoadItem, Document {
  type: "RORO";
  specifications: {
    quantity: number;
    unitType: string;
  };
}

export interface IAirFreightLoadItem extends BaseLoadItem, Document {
  type: "AIR";
  specifications: {
    weight: number;
    cbm: number;
  };
}

export type ILoadItem =
  | IFCLLoadItem
  | ILCLLoadItem
  | IROROLoadItem
  | IAirFreightLoadItem;

// DTOs for creating shipments
export interface CreateShipmentDTO {
  origin: string;
  destination: string;
  estimatedDeparture?: Date;
  estimatedArrival?: Date;
  notes?: string;
}

export interface UpdateShipmentDTO {
  origin?: string;
  destination?: string;
  status?: ShipmentStatus;
  forwarderId?: string;
  estimatedDeparture?: Date;
  estimatedArrival?: Date;
  actualDeparture?: Date;
  actualArrival?: Date;
  notes?: string;
}
