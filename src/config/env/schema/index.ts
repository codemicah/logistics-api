import { Joi } from "celebrate";

// define validation for all the env vars
export const schema = {
  PORT: Joi.number().required(),
  JWT_SECRET: Joi.string().required(),
  MONGODB_URI: Joi.string().default(
    "mongodb://localhost:27017/logistics-system"
  ),
};
