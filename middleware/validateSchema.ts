import {AnyObjectSchema, ValidationError} from "yup";
import {RequestHandler} from "express";
import createHTTPError from "http-errors";

const validateSchema =  (schema: AnyObjectSchema): RequestHandler => async (req, res, next) => {
  try {
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params
    });
    return next();
  } catch (e) {
    return next(createHTTPError(400, (e as ValidationError).message));
  }
}

export default validateSchema;