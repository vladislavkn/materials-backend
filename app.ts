import createHTTPError from "http-errors";
import express, { ErrorRequestHandler } from "express";
import path from "path";
import logger from "morgan";
import cookieParser from "cookie-parser";
import config from "./config";

import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import articlesRouter from "./routes/article";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: config.ORIGIN,
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/articles", articlesRouter);

app.use((req, res, next) => next(createHTTPError(404)));

app.use(((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    status,
    message: err.message || "Unknown error",
  });
}) as ErrorRequestHandler);

export default {
  initialize: () =>
    new Promise((resolve) =>
      app.listen(config.PORT, () => resolve(config.PORT))
    ),
};
