import {Request, RequestHandler} from "express";
import createHTTPError from "http-errors";
import {SessionRepo} from "../database";
import User from "../entities/user";
import Session from "../entities/session";

export interface RequestWithUser extends Request {
  user: User
}

export const getAuthSessionFromRequest = async (req: Request): Promise<Session | null> => {
  const sessionCookie: string | null = req.cookies.session;
  if (!sessionCookie) return null

  const session = await SessionRepo.findOne({
    where: {id: Number(sessionCookie)},
    relations: ["user"]
  });
  if (!session) return null;

  return session;
}

const auth: RequestHandler = async (req, res, next) => {
  const authSession = await getAuthSessionFromRequest(req);
  if (!authSession) return next(createHTTPError(401, 'Please login to view this page.'));
  (req as RequestWithUser).user = authSession.user;
  return next();
}


export default auth;