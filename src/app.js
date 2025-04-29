require("reflect-metadata");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
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
const commentReplyRoutes = require("./routes/commentReplyRoutes");
const storeRoutes = require("./routes/storeRoutes");
require("dotenv").config();

// Export the data source based on environment
let dataSource;
if (process.env.NODE_ENV === 'test') {
  // Use test data source for tests
  dataSource = require("./config/database.test").TestDataSource;
} else {
  // Use regular data source for development/production
  dataSource = require("./config/database").AppDataSource;
}

// Export the data source for use in tests
exports.dataSource = dataSource;

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
app.use("/api/comment-replies", commentReplyRoutes);
app.use("/api/stores", storeRoutes);

// Error handling middleware
app.use(errorHandler);

// Handle unhandled routes
app.all("*", (req, res, next) => {
  const error = new Error(`Can't find ${req.originalUrl} on this server!`);
  error.status = 404;
  next(error);
});

module.exports = app;