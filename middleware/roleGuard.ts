import {userRole} from "../entities/user";
import {RequestHandler} from "express";
import {RequestWithAuthData} from "./authGuard";
import createHTTPError from "http-errors";

const roleGuard = (...roles: userRole[]): RequestHandler => (req, res, next) => {
  const user = (req as RequestWithAuthData).user
  if(!user) {
    return next(createHTTPError(401, 'Resource is available only for authenticated users.'));
  }

  if(!roles.includes(user.role)) {
    return next(createHTTPError(403, 'Resource is not available for your role.'));
  }

  return next();
}

export default roleGuard;