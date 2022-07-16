import * as yup from "yup";
import { articleState } from "../../entities/article";

export const getArticlesRequestScheme = yup.object({
  query: yup.object({
    search: yup.string(),
    authorId: yup.string(),
    state: yup.string().oneOf(Object.keys(articleState)),
    skip: yup.string().default("0"),
    limit: yup.string().default("100"),
  }),
});

export type getArticlesRequestQuery = {
  search?: string;
  authorId?: string;
  state?: articleState;
  skip: string;
  limit: string;
};

export const createArticleRequestScheme = yup.object({
  body: yup.object({
    title: yup.string().required(),
    thumbnailText: yup.string(),
    text: yup.string().required(),
    state: yup
      .string()
      .oneOf(Object.keys(articleState))
      .default(articleState.DRAFT),
  }),
});

export const patchArticleRequestScheme = yup.object({
  body: yup.object({
    id: yup.number().required(),
    title: yup.string(),
    thumbnailText: yup.string(),
    text: yup.string(),
    state: yup.string().oneOf(Object.keys(articleState)),
  }),
});

export const deleteArticleRequestScheme = yup.object({
  body: yup.object({
    id: yup.number().required(),
  }),
});
