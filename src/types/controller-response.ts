import { Response } from "express";

type Controller<T = unknown> = {
  error?: string;
  data?: T;
  success?: boolean;
};

export type ControllerResponse<T = unknown> = Response<Controller<T>>;
