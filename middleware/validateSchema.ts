import {AnyObjectSchema, ValidationError} from "yup";
import {RequestHandler} from "express";
import createHTTPError from "http-errors";

const validateSchema = (schema: AnyObjectSchema): RequestHandler => async (req, res, next) => {
  try {
    const validationResult = await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params
    });
    req.body = {...req.body, ...validationResult.body};
    req.query = {...req.query, ...validationResult.query};
    req.params = {...req.params, ...validationResult.params};
    return next();
  } catch (e) {
    return next(createHTTPError(400, (e as ValidationError).message));
  }
}

export default validateSchema;