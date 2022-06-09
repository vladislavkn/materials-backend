import * as yup from "yup";
import {userRole} from "../../entities/user";

export const patchUserRequestScheme = yup.object({
  body: yup.object({
    id: yup.string().required(),
    name: yup.string(),
    role: yup.string().oneOf(Object.values(userRole)),
    email: yup.string().email()
  })
});

export const createUserRequestSchema = yup.object({
  body: yup.object({
    name: yup.string().required(),
    role: yup.string().oneOf(Object.values(userRole)).required(),
    email: yup.string().email().required(),
    password: yup.string().min(8).max(16).required(),
  })
});