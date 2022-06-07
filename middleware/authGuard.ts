import {Request, RequestHandler} from "express";
import createHTTPError from "http-errors";
import {sessionRepository} from "../database";
import User from "../entities/user";
import Session from "../entities/session";

export interface RequestWithAuthData extends Request {
  user: User
  session: Session
}

export const getAuthSessionFromRequest = async (req: Request): Promise<Session | null> => {
  const sessionCookie: string | null = req.cookies.session;
  if (!sessionCookie) return null

  try {
    const session = await sessionRepository.findOne({
      where: {id: Number(sessionCookie)},
      relations: ["user"]
    });
    return session ? session : null;
  } catch(e) {
    return null;
  }
}

const authGuard = (passAuthenticated=true): RequestHandler => async (req, res, next) => {
  const authSession = await getAuthSessionFromRequest(req);

  if (!authSession) {
    if(!passAuthenticated) return next();
    if(req.cookies.session) res.clearCookie("session");
    return next(createHTTPError(401, 'Resource is available only for authenticated users.'));
  }

  if(!passAuthenticated) return next(createHTTPError(400, 'Resource is available only for not authenticated users.'));
  (req as RequestWithAuthData).user = authSession.user;
  (req as RequestWithAuthData).session = authSession;
  return next();
}

export default authGuard;