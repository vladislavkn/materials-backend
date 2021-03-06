import {Router} from "express";
import {authGuard, RequestWithAuthData} from "../../middleware/authGuard";
import roleGuard from "../../middleware/roleGuard";
import User, {userRole} from "../../entities/user";
import {userRepository} from "../../database";
import createHTTPError from "http-errors";
import validateSchema from "../../middleware/validateSchema";
import {
  createUserRequestScheme,
  deleteUserRequestScheme,
  getUsersRequestScheme,
  patchUserRequestScheme
} from "./schemes";
import {DeepPartial} from "typeorm";
import generateSalt from "../../utils/generateSalt";
import filterObject from "../../utils/filterObject";

const router = Router();

router.get('', authGuard, roleGuard(userRole.ADMIN), validateSchema(getUsersRequestScheme), async (req, res, next) => {
  try {
    const usersQueryBuilder = userRepository.createQueryBuilder("user")
    .select(["user.id", "user.name", "user.email", "user.role", "user.createdAt"])

    const userId = req.query.id;
    if (userId) {
      usersQueryBuilder.where("id = :id", {id: Number(userId)});
    }

    const users = await usersQueryBuilder.getMany();

    return res.status(200).json({
      ok: true,
      ...(userId ? {user: users[0] ?? null} : {users})
    });
  } catch (e) {
    return next(createHTTPError(500, "Error while getting users from a database."));
  }
});

router.patch('', authGuard, validateSchema(patchUserRequestScheme), async (req, res, next) => {
  const {id, name, email} = req.body;
  let {role} = req.body;

  const user = (req as RequestWithAuthData).user
  const userUpdatesHimself = id == user.id;
  const userIsAdmin = user.role == userRole.ADMIN;

  if (!userUpdatesHimself && !userIsAdmin) {
    return next(createHTTPError(403, "This resource is not available for your role or your are not the the user you want to update."));
  }

  if (!userIsAdmin && role) {
    return next(createHTTPError(403, "Role updating is not available for your role."));
  }

  const fieldsToUpdate = filterObject<Partial<User>>({name, email, role});

  try {
    const userWithUpdatedFields = userRepository.create(fieldsToUpdate);
    const updateUserResult = await userRepository.createQueryBuilder("user")
    .update(userWithUpdatedFields)
    .where("id = :id", {id})
    .returning('*')
    .updateEntity(true)
    .execute();

    if (!updateUserResult.raw[0]) throw new Error();

    const user = userRepository.create(updateUserResult.raw[0] as DeepPartial<User>);
    return res.status(200).json({
      ok: true,
      user: user.data,
    });
  } catch (e) {
    return next(createHTTPError(500, "Error while saving a user to the database."));
  }
});

router.post('', authGuard, roleGuard(userRole.ADMIN), validateSchema(createUserRequestScheme), async (req, res, next) => {
  const {name, email, role, password} = req.body;

  try {
    const salt = generateSalt();
    const user = userRepository.create({
      name,
      email,
      role,
      salt,
      passwordHash: await User.hashPassword(password, salt)
    });
    await userRepository.save(user);
    return res.status(200).json({
      ok: true,
      user: user.data
    });
  } catch (e) {
    return next(createHTTPError(500, "Error while saving a user to the database."));
  }
});

router.delete('', authGuard, validateSchema(deleteUserRequestScheme), async (req, res, next) => {
  const {id} = req.body;
  const user = (req as RequestWithAuthData).user
  const userUpdatesHimself = id == user.id;
  const userIsAdmin = user.role == userRole.ADMIN;

  if (!userUpdatesHimself && !userIsAdmin) {
    return next(createHTTPError(403, "This resource is not available for your role or your are not the the user you want to delete."));
  }

  try {
    await userRepository.delete(id);
    return res.status(200).json({
      ok: true
    });
  } catch(e) {
    return next(createHTTPError(500, "Error while deleting a user from the database."));
  }
});

export default router;