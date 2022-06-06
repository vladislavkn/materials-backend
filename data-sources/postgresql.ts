import "reflect-metadata";
import { DataSource } from "typeorm";
import config from "../config";
import {User} from "../entities/user";

export default () => new DataSource({
  // @ts-ignore
  type: config.DB_TYPE,
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  synchronize: true,
  logging: true,
  entities: [User],
  subscribers: [],
  migrations: [],
})