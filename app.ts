import createHTTPError from "http-errors";
import express, {ErrorRequestHandler} from "express";
import path from "path";
import logger from "morgan";
import cookieParser from "cookie-parser"
import config from "./config";
import connectPostgresqlDataSource from "./data-sources/postgresql";

import indexRouter from "./routes/auth";

const app = express();
connectPostgresqlDataSource();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use((req, res, next) =>
  next(createHTTPError(404))
);

app.use(((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    status,
    message: err.message || "Unknown error"
  })
}) as ErrorRequestHandler);

app.listen(config.PORT, () => console.log(`Server is active on ${config.PORT}`))
