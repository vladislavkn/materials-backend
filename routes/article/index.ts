import {Router} from "express";
import {authGuard, RequestWithAuthData} from "../../middleware/authGuard";
import validateSchema from "../../middleware/validateSchema";
import {createArticleQuery, getArticlesRequestQuery, getArticlesRequestScheme} from "./schemes";
import filterObject from "../../utils/filterObject";
import {articleRepository} from "../../database";
import createHTTPError from "http-errors";
import {userRole} from "../../entities/user";
import Article from "../../entities/article";
import {DeepPartial, TypeORMError} from "typeorm";

const router = Router();

// Get posts
router.get('', authGuard, validateSchema(getArticlesRequestScheme), async (req, res, next) => {
  const {title, authorId, text, state, skip, limit} = req.query;
  const searchOptions = filterObject<getArticlesRequestQuery>({title, authorId, text, state, skip, limit});
  console.log({searchOptions});
  try {
    const articlesQueryBuilder = articleRepository.createQueryBuilder("a")
    .where({state: searchOptions.state})
    .select(["a.title", "a.thumbnailText", "a.text"])
    .offset(Number(searchOptions.skip))
    .limit(Number(searchOptions.limit))

    if (searchOptions.authorId) {
      articlesQueryBuilder.where({author: {id: Number(searchOptions.authorId)}});
    }

    if (searchOptions.title) {
      articlesQueryBuilder.where("a.title like :title", {title: `%${searchOptions.title}%`});
    }

    if (searchOptions.text) {
      articlesQueryBuilder.where("a.text like :text", {text: `%${searchOptions.text}%`});
    }

    const articles = await articlesQueryBuilder.getMany();
    res.status(200).json({
      ok: true,
      articles
    })
  } catch (e) {
    console.log(e);
    next(createHTTPError(500, "Error while getting articles from the database."));
  }
});

// Create new post
router.post('', authGuard, validateSchema(createArticleQuery), async (req, res, next) => {
  const {title, text, thumbnailText} = req.body;
  const user = (req as RequestWithAuthData).user;
  const newArticleFields: DeepPartial<Article> = {
    title, text, thumbnailText,
    author: user
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
        author: user.data
      }
    });
  } catch (e) {
    // @ts-ignore
    if (e.code === "23505") {
      return next(createHTTPError(400, "An article with the same title already exists."));
    }
    return next(createHTTPError(500, "Error while saving a new article to the database."));
  }
});

// Update a post
router.patch('', authGuard, (req, res, next) => {
});

// Delete a post
router.delete('', authGuard, (req, res, next) => {
});

export default router;