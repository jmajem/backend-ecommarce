const { EntitySchema } = require("typeorm");

// Modified User entity for testing
const UserTest = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "integer",
      generated: "increment",
    },
    firstName: {
      type: "varchar",
      nullable: false,
    },
    lastName: {
      type: "varchar",
      nullable: false,
    },
    email: {
      type: "varchar",
      unique: true,
      nullable: false,
    },
    password: {
      type: "varchar",
      nullable: false,
    },
    phoneNumber: {
      type: "varchar",
      nullable: false,
    },
    role: {
      type: "varchar",
      default: "USER",
    },
    isActive: {
      type: "boolean",
      default: true,
    },
    createdAt: {
      type: "datetime",
      createDate: true,
    },
    updatedAt: {
      type: "datetime",
      updateDate: true,
    },
  },
});

// Simple Product entity for tests
const ProductTest = new EntitySchema({
  name: "Product",
  tableName: "products",
  columns: {
    id: {
      primary: true,
      type: "integer",
      generated: "increment",
    },
    name: {
      type: "varchar",
      nullable: false,
    },
    description: {
      type: "text",
      nullable: true,
    },
    price: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
    },
    stock: {
      type: "integer",
      nullable: false,
    },
    isActive: {
      type: "boolean",
      default: true,
    },
    createdAt: {
      type: "datetime",
      createDate: true,
    },
    updatedAt: {
      type: "datetime",
      updateDate: true,
    },
  },
});

// Simple Category entity for tests
const CategoryTest = new EntitySchema({
  name: "Category",
  tableName: "categories",
  columns: {
    id: {
      primary: true,
      type: "integer",
      generated: "increment",
    },
    name: {
      type: "varchar",
      nullable: false,
    },
    description: {
      type: "text",
      nullable: true,
    },
    createdAt: {
      type: "datetime",
      createDate: true,
    },
    updatedAt: {
      type: "datetime",
      updateDate: true,
    },
  },
});

module.exports = {
  UserTest,
  ProductTest,
  CategoryTest,
};