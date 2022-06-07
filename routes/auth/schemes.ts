import * as yup from "yup";

export const registerRequestSchema = yup.object({
  body: yup.object({
    name: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().min(8).max(16).required()
  })
});

export const loginRequestSchema = yup.object({
  body: yup.object({
    email: yup.string().email().required(),
    password: yup.string().min(8).max(16).required()
  })
});