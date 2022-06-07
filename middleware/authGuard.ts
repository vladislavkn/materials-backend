import {Request, RequestHandler} from "express";
import createHTTPError from "http-errors";
import {SessionRepo} from "../database";
import User from "../entities/user";
import Session from "../entities/session";

export interface RequestWithAuthData extends Request {
  user: User
  session: Session
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

const authGuard: RequestHandler = async (req, res, next) => {
  const authSession = await getAuthSessionFromRequest(req);
  if (!authSession) {
    if(req.cookies.session) res.clearCookie("session");
    return next(createHTTPError(401, 'Please login to view this page.'));
  }
  (req as RequestWithAuthData).user = authSession.user;
  (req as RequestWithAuthData).session = authSession;
  return next();
}

export default authGuard;