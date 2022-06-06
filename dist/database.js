"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionRepo = exports.UserRepo = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const config_1 = __importDefault(require("./config"));
const user_1 = __importDefault(require("./entities/user"));
const session_1 = __importDefault(require("./entities/session"));
const Database = new typeorm_1.DataSource({
    // @ts-ignore
    type: config_1.default.DB_TYPE,
    host: config_1.default.DB_HOST,
    port: config_1.default.DB_PORT,
    username: config_1.default.DB_USERNAME,
    password: config_1.default.DB_PASSWORD,
    database: config_1.default.DB_NAME,
    synchronize: true,
    logging: true,
    entities: [user_1.default, session_1.default],
    subscribers: [],
    migrations: [],
});
exports.default = Database;
exports.UserRepo = Database.getRepository(user_1.default);
exports.SessionRepo = Database.getRepository(session_1.default);
