import * as yup from "yup"
import {articleState} from "../../entities/article";

export const getArticlesRequestScheme = yup.object({
  query: yup.object({
    title: yup.string(),
    authorId: yup.string(),
    text: yup.string(),
    state: yup.string().oneOf(Object.keys(articleState)).default(articleState.PUBLISHED),
    skip: yup.string().required().default("0"),
    limit: yup.string().required().default("100"),
  })
})

export type getArticlesRequestQuery = {
  title?: string,
  authorId?: string,
  text?: string,
  state: articleState,
  skip: string,
  limit: string,
}

export const createArticleQuery = yup.object({
  body: yup.object({
    title: yup.string().required(),
    thumbnailText: yup.string(),
    text: yup.string().required(),
    state: yup.string().oneOf(Object.keys(articleState)).default(articleState.DRAFT),
  })
});