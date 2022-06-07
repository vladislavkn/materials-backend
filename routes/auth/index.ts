import {Router} from "express";
import authGuard, {RequestWithAuthData} from "../../middleware/authGuard";
import {SessionRepo, UserRepo} from "../../database";
import createHTTPError from "http-errors";
import User from "../../entities/user";
import config from "../../config";
import crypto from "crypto";
import Session from "../../entities/session";
import validateSchema from "../../middleware/validateSchema";
import {loginRequestSchema, registerRequestSchema} from "./schemes";

const router = Router();

router.post('/register', authGuard(false), validateSchema(registerRequestSchema), async (req, res, next) => {
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
    ok: true,
  });
});

router.post('/login', authGuard(false), validateSchema(loginRequestSchema), async (req, res, next) => {
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

  return res.status(200).json({
    ok: true, user: userData
  });
});

router.post('/logout', authGuard(), async (req, res, next) => {
  res.clearCookie("session");
  const session = (req as RequestWithAuthData).session;
  await SessionRepo.delete(session).catch((e) => next(createHTTPError(500, e.message)));

  return res.status(200).json({
    ok: true
  });
});

router.get('/me', authGuard(), async (req, res) => {
  const {passwordHash, createdAt, ...userDate} = (req as RequestWithAuthData).user;
  return res.status(200).json({
    ok: true,
    user: userDate
  });
});

export default router;
