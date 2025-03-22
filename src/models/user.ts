import mongoose, { Schema } from "mongoose";
import { IUser } from "../types/user.interface";

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["shipper", "forwarder", "admin"],
      required: true,
    },
    profile: {
      name: {
        type: String,
        required: true,
      },
      company: {
        type: String,
        required: true,
      },
      contactNumber: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
