const { createConnection } = require("typeorm");
const typeormConfig = require("./typeorm.config");

let connection;

const connectDatabase = async () => {
  try {
    if (!connection) {
      connection = await createConnection(typeormConfig);
      console.log("Database connected successfully");
    }
    return connection;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
};

module.exports = connectDatabase;
