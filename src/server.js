require("reflect-metadata");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { AppDataSource } = require("./config/database");
const errorHandler = require("./middleware/errorHandler");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const managerRoutes = require("./routes/managerRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const commentRoutes = require("./routes/commentRoutes");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    // Routes
    app.use("/api/users", userRoutes);
    app.use("/api/products", productRoutes);
    app.use("/api/categories", categoryRoutes);
    app.use("/api/carts", cartRoutes);
    app.use("/api/orders", orderRoutes);
    app.use("/api/sellers", sellerRoutes);
    app.use("/api/managers", managerRoutes);
    app.use("/api/invoices", invoiceRoutes);
    app.use("/api/comments", commentRoutes);

    // Error handling middleware
    app.use(errorHandler);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(
        `API Documentation available at http://localhost:${PORT}/api-docs`
      );
    });
  } catch (error) {
    if (error.code === "42P07") {
      // Table already exists error
      console.log("Tables already exist, continuing with existing schema...");

      // Routes
      app.use("/api/users", userRoutes);
      app.use("/api/products", productRoutes);
      app.use("/api/categories", categoryRoutes);
      app.use("/api/carts", cartRoutes);
      app.use("/api/orders", orderRoutes);
      app.use("/api/invoices", invoiceRoutes);
      app.use("/api/comments", commentRoutes);
      app.use("/api/managers", managerRoutes);
      app.use("/api/sellers", sellerRoutes);

      // Error handling middleware
      app.use(errorHandler);

      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } else {
      console.error("Error during database initialization:", error);
      process.exit(1);
    }
  }
};

initializeDatabase();

// Handle unhandled routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
