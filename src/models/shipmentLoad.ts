import mongoose, { Schema } from "mongoose";
import { IShipmentLoad } from "../types/shipment.interface";

const ShipmentLoadSchema: Schema = new Schema(
  {
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
    },
    loadNumber: {
      type: String,
      required: true,
      unique: true,
    },
    reference: {
      type: String,
      required: true,
    },
    containerNumber: {
      type: String,
    },
    containerSize: {
      type: String,
    },
    containerType: {
      type: String,
    },
    weight: {
      type: Number,
    },
    description: {
      type: String,
    },
    transportMode: {
      type: String,
      enum: ["FCL", "LCL", "RORO", "AIR"],
      required: true,
      default: "FCL",
    },
    status: {
      type: String,
      required: true,
      default: "pending",
    },
    pickupAddress: {
      type: String,
    },
    deliveryAddress: {
      type: String,
    },
    pickupDate: {
      type: Date,
    },
    deliveryDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IShipmentLoad>(
  "ShipmentLoad",
  ShipmentLoadSchema
);
