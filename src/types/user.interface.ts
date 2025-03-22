import { Document } from "mongoose";

export interface IUserProfile {
  name: string;
  company: string;
  contactNumber: string;
}

export interface IUser extends Document {
  email: string;
  password: string;
  role: "shipper" | "forwarder" | "admin";
  profile: IUserProfile;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserResponse {
  id: string;
  email: string;
  role: string;
  profile: IUserProfile;
  token: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  email: string;
  password: string;
  role: "shipper" | "forwarder" | "admin";
  profile: IUserProfile;
}
