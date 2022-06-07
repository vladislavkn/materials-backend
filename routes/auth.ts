import {Router} from "express";
import authGuard, {getAuthSessionFromRequest, RequestWithAuthData} from "../middleware/authGuard";
import {SessionRepo, UserRepo} from "../database";
import createHTTPError from "http-errors";
import User from "../entities/user";
import config from "../config";
import crypto from "crypto";
import Session from "../entities/session";

const router = Router();

router.post('/register', async (req, res, next) => {
  const {name, email, password}: {
    name: string,
    email: string,
    password: string,
  } = req.body;
  const userCandidate = await UserRepo.findOneBy({name});
  if (userCandidate) return next(createHTTPError(400, "User with the same email already exists."));

  const user = new User();
  user.name = name;
  user.email = email;
  try {
    user.passwordHash =
      crypto.pbkdf2Sync(password, config.PASSWORD_SALT, 1000, 64, `sha512`)
      .toString(`hex`);
  } catch (e) {
    return next(createHTTPError(500, "Error in password hashing."))
  }
  await UserRepo.save(user).catch((e) => next(createHTTPError(500, e.message)));

  return res.status(200).send({
    message: "User has been registered"
  });
});

router.post('/login', async (req, res, next) => {
  let authSession = await getAuthSessionFromRequest(req);
  if (authSession) return next(createHTTPError(400, "User is already logged in."));

  const {email, password}: {
    email: string,
    password: string,
  } = req.body;

  const user = await UserRepo.findOneBy({email});
  if (!user) return next(createHTTPError(400, "Email or password is incorrect."));

  const unCheckedPasswordHash =
    crypto.pbkdf2Sync(password, config.PASSWORD_SALT, 1000, 64, `sha512`)
    .toString(`hex`);

  if (unCheckedPasswordHash != user.passwordHash) return next(createHTTPError(400, "Email or password is incorrect."));
  const session = new Session();
  session.user = user;

  await SessionRepo.save(session).catch((e) => next(createHTTPError(500, e.message)));

  res.cookie("session", session.id, {
    httpOnly: true
  });

  const {passwordHash, createdAt, ...userData} = user

  return res.status(200).json({user: userData});
});

router.post('/logout', authGuard, async (req, res, next) => {
  res.clearCookie("session");
  const session = (req as RequestWithAuthData).session;
  await SessionRepo.delete(session).catch((e) => next(createHTTPError(500, e.message)));

  return res.status(200).send();
});

router.get('/me', authGuard, async (req, res) => {
  const {passwordHash, createdAt, ...userDate} = (req as RequestWithAuthData).user;
  return res.status(200).json({user: userDate});
});

export default router;
