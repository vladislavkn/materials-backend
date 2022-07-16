import { Router } from "express";
import { authGuard, RequestWithAuthData } from "../../middleware/authGuard";
import validateSchema from "../../middleware/validateSchema";
import {
  createArticleRequestScheme,
  deleteArticleRequestScheme,
  getArticlesRequestQuery,
  getArticlesRequestScheme,
  patchArticleRequestScheme,
} from "./schemes";
import filterObject from "../../utils/filterObject";
import { articleRepository } from "../../database";
import createHTTPError, { HttpError } from "http-errors";
import { userRole } from "../../entities/user";
import Article, { articleState } from "../../entities/article";
import { Brackets, DeepPartial } from "typeorm";
import canUserModifyTheArticle from "./canUserModifyTheArticle";

const router = Router();

// Get articles
router.get(
  "",
  validateSchema(getArticlesRequestScheme),
  async (req, res, next) => {
    const { authorId, articleId, search, state, skip, limit } = req.query;
    const searchOptions = filterObject<getArticlesRequestQuery>({
      authorId,
      search,
      articleId,
      state,
      skip,
      limit,
    });

    try {
      const articlesQueryBuilder = articleRepository
        .createQueryBuilder("a")
        .leftJoinAndSelect("a.author", "author")
        .select(["a.title", "a.text", "a.id", "author.id", "author.name"])
        .offset(Number(searchOptions.skip))
        .limit(Number(searchOptions.limit));

      if (searchOptions.state) {
        articlesQueryBuilder.andWhere({ state: searchOptions.state });
      }

      if (searchOptions.authorId) {
        articlesQueryBuilder.andWhere({
          author: { id: Number(searchOptions.authorId) },
        });
      }

      if (searchOptions.articleId) {
        articlesQueryBuilder.andWhere({
          id: Number(searchOptions.articleId),
        });
      }

      if (searchOptions.search) {
        articlesQueryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where("a.title like :search", {
              search: `%${searchOptions.search}%`,
            }).orWhere("a.text like :search", {
              search: `%${searchOptions.search}%`,
            });
          })
        );
      }

      const articles = await articlesQueryBuilder.getMany();
      res.status(200).json({
        ok: true,
        articles,
      });
    } catch (e) {
      console.log(e);
      next(
        createHTTPError(500, "Error while getting articles from the database.")
      );
    }
  }
);

// Create new article
router.post(
  "",
  authGuard,
  validateSchema(createArticleRequestScheme),
  async (req, res, next) => {
    const { title, text } = req.body;
    const user = (req as RequestWithAuthData).user;
    const newArticleFields: DeepPartial<Article> = {
      title,
      text,
      author: user,
    };

    // Admin can create articles with custom state
    if (user.role == userRole.ADMIN) {
      newArticleFields.state = req.body.state;
    }

    try {
      const newArticle = articleRepository.create(newArticleFields);
      const article = await articleRepository.save(newArticle);
      return res.status(200).json({
        ok: true,
        article: {
          ...article,
          author: user.data,
        },
      });
    } catch (e) {
      // @ts-ignore
      if (e.code === "23505") {
        return next(
          createHTTPError(400, "An article with the same title already exists.")
        );
      }
      return next(
        createHTTPError(
          500,
          "Error while saving a new article to the database."
        )
      );
    }
  }
);

// Update an article
router.patch(
  "",
  authGuard,
  validateSchema(patchArticleRequestScheme),
  async (req, res, next) => {
    const { title, text, state, id } = req.body;
    const user = (req as RequestWithAuthData).user;
    const userIsModeratorOrAdmin = [
      userRole.ADMIN,
      userRole.MODERATOR,
    ].includes(user.role);

    // Check if user can update the article
    const mayBeError = await canUserModifyTheArticle(user, id);
    if (mayBeError instanceof HttpError) {
      return next(mayBeError);
    }

    const fieldsToUpdate = filterObject<DeepPartial<Article>>({
      title,
      text,

      state,
    });

    // Only Admin or moderator can publish articles
    if (
      !userIsModeratorOrAdmin &&
      fieldsToUpdate.state == articleState.PUBLISHED
    ) {
      delete fieldsToUpdate.state;
    }

    try {
      const articleWithUpdatedFields = articleRepository.create(fieldsToUpdate);
      const updateArticleResult = await articleRepository
        .createQueryBuilder("article")
        .update(articleWithUpdatedFields)
        .where("id = :id", { id })
        .returning("*")
        .updateEntity(true)
        .execute();

      if (!updateArticleResult.raw[0]) throw new Error();

      const article = articleRepository.create(
        updateArticleResult.raw[0] as DeepPartial<Article>
      );
      return res.status(200).json({
        ok: true,
        article,
      });
    } catch (e) {
      return next(
        createHTTPError(500, "Error while saving the article to the database.")
      );
    }
  }
);

// Delete an article
router.delete(
  "",
  authGuard,
  validateSchema(deleteArticleRequestScheme),
  async (req, res, next) => {
    const { id } = req.body;
    const user = (req as RequestWithAuthData).user;

    // Check if user can update the article
    const mayBeError = await canUserModifyTheArticle(user, id);
    if (mayBeError instanceof HttpError) {
      return next(mayBeError);
    }

    try {
      await articleRepository.delete(id);
      return res.status(200).json({
        ok: true,
      });
    } catch (e) {
      return next(
        createHTTPError(
          500,
          "Error while deleting the article from the database."
        )
      );
    }
  }
);

export default router;
