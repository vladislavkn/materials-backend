import {NextFunction} from "express";
import User, {userRole} from "../../entities/user";
import {articleRepository} from "../../database";
import createHTTPError, {HttpError} from "http-errors";

const canUserModifyTheArticle = async (
  user: User,
  articleId: number,
): Promise<HttpError | true> => {
  const userIsModeratorOrAdmin = [userRole.ADMIN, userRole.MODERATOR].includes(user.role);

  // Check if user can delete the article
  try {
    const article = await articleRepository.findOneOrFail({
      relations: ["author"],
      where: {id: articleId}
    });

    if (!userIsModeratorOrAdmin && article.author.id !== user.id) {
      return createHTTPError(403, "This resource is not available for your role or you are not the author of that resource.");
    }
  } catch (e) {
    return createHTTPError(500, "Error while getting the article from the database.");
  }

  return true;
}

export default canUserModifyTheArticle;