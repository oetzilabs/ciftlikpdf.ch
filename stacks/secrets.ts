export const SECRET = {
  DATABASE_URL: new sst.Secret("DATABASE_URL"),
  DATABASE_AUTH_TOKEN: new sst.Secret("DATABASE_AUTH_TOKEN"),
  JWT_SECRET: new sst.Secret("JWT_SECRET"),
};
