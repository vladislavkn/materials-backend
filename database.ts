import "reflect-metadata";
import { DataSource } from "typeorm";
import config from "./config";
import User from "./entities/user";
import Session from "./entities/session";

const Database = new DataSource({
  // @ts-ignore
  type: config.DB_TYPE,
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  synchronize: true,
  logging: true,
  entities: [User, Session],
  subscribers: [],
  migrations: [],
});

export default Database;

export const userRepository = Database.getRepository(User);
export const sessionRepository = Database.getRepository(Session);