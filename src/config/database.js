const { DataSource } = require("typeorm");
const entities = require("../entities");
const dotenv = require("dotenv");

dotenv.config();

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "ecommerce",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV !== "production",
  entities: Object.values(entities),
  migrations: [],
  subscribers: [],
  migrationsRun: false,
  dropSchema: false,
  skipSchemaCheck: true,
});

module.exports = { AppDataSource };
