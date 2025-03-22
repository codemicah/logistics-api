import { Response } from "express";

export const errorResponse = (
  res: Response,
  statusCode: number = 500,
  message: string,
  error?: any
) => {
  const responseObj: any = {
    success: false,
    message,
  };

  if (error) {
    responseObj.error = error;
  }

  return res.status(statusCode).json(responseObj);
};

export const successResponse = (
  res: Response,
  statusCode: number = 200,
  data?: any,
  message: string = "Success"
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
