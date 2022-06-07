import {Router} from "express";
import authGuard, {RequestWithAuthData} from "../../middleware/authGuard";
import {sessionRepository, userRepository} from "../../database";
import createHTTPError from "http-errors";
import config from "../../config";
import crypto from "crypto";
import validateSchema from "../../middleware/validateSchema";
import {loginRequestSchema, registerRequestSchema} from "./schemes";

const router = Router();

router.post('/register', authGuard(false), validateSchema(registerRequestSchema), async (req, res, next) => {
  const {name, email, password} = req.body;
  const userCandidate = await userRepository.findOneBy({name});
  if (userCandidate) {
    return next(createHTTPError(400, "User with the same email already exists."));
  }

  try {
    const user = userRepository.create({
      name,
      email,
      passwordHash: crypto.pbkdf2Sync(password, config.PASSWORD_SALT, 1000, 64, `sha512`).toString(`hex`)
    });
    await userRepository.save(user);
  } catch (e) {
    return next(createHTTPError(500, "Error while saving user on server."))
  }

  return res.status(200).send({
    ok: true,
  });
});

router.post('/login', authGuard(false), validateSchema(loginRequestSchema), async (req, res, next) => {
  const {email, password} = req.body;

  const user = await userRepository.findOneBy({email});
  if (!user) {
    return next(createHTTPError(400, "Email or password is incorrect."));
  }

  const attemptPasswordHash =
    crypto.pbkdf2Sync(password, config.PASSWORD_SALT, 1000, 64, `sha512`)
    .toString(`hex`);

  if (attemptPasswordHash != user.passwordHash) {
    return next(createHTTPError(400, "Email or password is incorrect."));
  }

  try {
    let session = await sessionRepository.findOneBy({user});
    if(!session) {
      session = sessionRepository.create({user});
      await sessionRepository.save(session);
    }
    res.cookie("session", session.id, {httpOnly: true});
  } catch (e) {
    return next(createHTTPError(500, "Error while saving session on server."))
  }

  return res.status(200).json({
    ok: true, user: user.data
  });
});

router.post('/logout', authGuard(), async (req, res, next) => {
  res.clearCookie("session");
  const session = (req as RequestWithAuthData).session;
  try {
    await sessionRepository.delete(session)
  } catch (e) {
    next(createHTTPError(500, (e as Error).message));
  }

  return res.status(200).json({
    ok: true
  });
});

router.get('/me', authGuard(), async (req, res) => {
  return res.status(200).json({
    ok: true,
    user: (req as RequestWithAuthData).user.data
  });
});

export default router;
