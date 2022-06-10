import "reflect-metadata";
import { DataSource } from "typeorm";
import config from "./config";
import User from "./entities/user";
import Session from "./entities/session";
import Article from "./entities/article";

const database = new DataSource({
  // @ts-ignore
  type: config.DB_TYPE,
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  synchronize: true,
  logging: true,
  entities: [User, Session, Article],
  subscribers: [],
  migrations: [],
});

export default database;

export const userRepository = database.getRepository(User);
export const sessionRepository = database.getRepository(Session);
export const articleRepository = database.getRepository(Article);