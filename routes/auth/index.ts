import {Router} from "express";
import {authGuard, noAuthGuard, RequestWithAuthData} from "../../middleware/authGuard";
import {sessionRepository, userRepository} from "../../database";
import createHTTPError from "http-errors";
import validateSchema from "../../middleware/validateSchema";
import {loginRequestSchema, registerRequestSchema} from "./schemes";
import User from "../../entities/user";
import generateSalt from "../../utils/generateSalt";

const router = Router();

router.post('/register', noAuthGuard, validateSchema(registerRequestSchema), async (req, res, next) => {
  const {name, email, password} = req.body;
  const userCandidate = await userRepository.findOneBy({name});
  if (userCandidate) {
    return next(createHTTPError(400, "User with the same email already exists."));
  }

  try {
    const salt = generateSalt();
    const user = userRepository.create({
      name,
      email,
      salt,
      passwordHash: await User.hashPassword(password, salt)
    });
    await userRepository.save(user);
  } catch (e) {
    return next(createHTTPError(500, "Error while saving user on server."))
  }

  return res.status(200).send({
    ok: true,
  });
});

router.post('/login', noAuthGuard, validateSchema(loginRequestSchema), async (req, res, next) => {
  const {email, password} = req.body;

  const user = await userRepository.findOneBy({email});
  if (!user) {
    return next(createHTTPError(400, "Email or password is incorrect."));
  }

  const isPasswordValid = await user.validatePassword(password);
  if (!isPasswordValid) {
    return next(createHTTPError(400, "Email or password is incorrect."));
  }

  try {
    let session = await sessionRepository.findOne({
      relations: ["user"],
      where: {
        user: {
          id: user.id
        }
      }
    });
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

router.post('/logout', authGuard, async (req, res, next) => {
  res.clearCookie("session");
  const session = (req as RequestWithAuthData).session;
  try {
    await sessionRepository.delete({ id: session.id })
  } catch (e) {
    next(createHTTPError(500, (e as Error).message));
  }

  return res.status(200).json({
    ok: true
  });
});

router.get('/me', authGuard, async (req, res) => {
  return res.status(200).json({
    ok: true,
    user: (req as RequestWithAuthData).user.data
  });
});

export default router;
