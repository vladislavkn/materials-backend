export default {
  ORIGIN: process.env.ORIGIN || "http://localhost:3000",
  PORT: process.env.PORT || 4000,
  DB_PORT: Number(process.env.DB_PORT) || 5432,
  DB_USERNAME: process.env.DB_USERNAME || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "root",
  DB_NAME: process.env.DB_NAME || "root",
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_TYPE: process.env.DB_TYPE || "postgres",
  PASSWORD_SALT: process.env.PASSWORD_SALT || "salt",
  IS_PRODUCTION: process.env.NODE_ENV == "production",
};
