const dotEnv = require("dotenv");

if (process.env.NODE_ENV !== "prod") {
  const configFile = `./.env.${process.env.NODE_ENV}`;
  dotEnv.config({ path: configFile });
} else {
  dotEnv.config();
}

module.exports = {
  PORT: process.env.PORT,
  APP_SECRET: process.env.APP_SECRET,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
  DB_DIALECT: process.env.DB_DIALECT,
  JWT_SECRET: process.env.JWT_SECRET,
  URL: process.env.URL,
  URL_Postfix: process.env.URL_Postfix,
  API_KEY_TINIFY: process.env.API_KEY_TINIFY,
  REGION: process.env.REGION,
  BUCKET: process.env.BUCKET,
  ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
  SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
};
