import mongoose, { Schema } from "mongoose";
import {
  ILoadItem,
  IFCLLoadItem,
  ILCLLoadItem,
  IROROLoadItem,
  IAirFreightLoadItem,
} from "../types/shipment.interface";

// Base schema for all load items
const LoadItemSchema = new Schema(
  {
    shipmentLoadId: {
      type: Schema.Types.ObjectId,
      ref: "ShipmentLoad",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dangerousGoods: {
      type: Boolean,
      required: true,
      default: false,
    },
    specialInstructions: {
      type: String,
    },
    type: {
      type: String,
      required: true,
      enum: ["FCL", "LCL", "RORO", "AIR"],
    },
  },
  {
    timestamps: true,
    discriminatorKey: "type",
  }
);

// Create the base model
const LoadItemModel = mongoose.model<ILoadItem>("LoadItem", LoadItemSchema);

// FCL Load Item
const FCLLoadItemSchema = new Schema({
  specifications: {
    containerSize: {
      type: String,
      enum: ["20ft", "40ft", "45ft"],
      required: true,
    },
    containerType: {
      type: String,
      required: true,
    },
  },
});

// LCL Load Item
const LCLLoadItemSchema = new Schema({
  specifications: {
    weight: {
      type: Number,
      required: true,
    },
    cbm: {
      type: Number,
      required: true,
    },
  },
});

// RORO Load Item
const ROROLoadItemSchema = new Schema({
  specifications: {
    quantity: {
      type: Number,
      required: true,
    },
    unitType: {
      type: String,
      required: true,
    },
  },
});

// Air Freight Load Item
const AirFreightLoadItemSchema = new Schema({
  specifications: {
    weight: {
      type: Number,
      required: true,
    },
    cbm: {
      type: Number,
      required: true,
    },
  },
});

// Create discriminator models
export const FCLLoadItem = LoadItemModel.discriminator<IFCLLoadItem>(
  "FCL",
  FCLLoadItemSchema
);

export const LCLLoadItem = LoadItemModel.discriminator<ILCLLoadItem>(
  "LCL",
  LCLLoadItemSchema
);

export const ROROLoadItem = LoadItemModel.discriminator<IROROLoadItem>(
  "RORO",
  ROROLoadItemSchema
);

export const AirFreightLoadItem =
  LoadItemModel.discriminator<IAirFreightLoadItem>(
    "AIR",
    AirFreightLoadItemSchema
  );

export default LoadItemModel;
