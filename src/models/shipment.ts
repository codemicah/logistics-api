import mongoose, { Schema } from "mongoose";
import { IShipment } from "../types/shipment.interface";

const ShipmentSchema: Schema = new Schema(
  {
    shipmentNumber: {
      type: String,
      required: true,
      unique: true,
    },
    origin: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "confirmed",
        "in_progress",
        "delivered",
        "cancelled",
      ],
      required: true,
      default: "draft",
    },
    shipperId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    forwarderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    estimatedDeparture: {
      type: Date,
    },
    estimatedArrival: {
      type: Date,
    },
    actualDeparture: {
      type: Date,
    },
    actualArrival: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Generate shipment number before saving
ShipmentSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.model("Shipment").countDocuments();
    this.shipmentNumber = `SHP-${Date.now().toString().slice(-6)}-${(count + 1)
      .toString()
      .padStart(4, "0")}`;
  }
  next();
});

export default mongoose.model<IShipment>("Shipment", ShipmentSchema);
