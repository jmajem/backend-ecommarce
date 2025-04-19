const { EntitySchema } = require("typeorm");

const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    username: {
      type: "varchar",
      nullable: false,
      unique: true,
    },
    email: {
      type: "varchar",
      nullable: false,
      unique: true,
    },
    password: {
      type: "varchar",
      nullable: false,
    },
    firstName: {
      type: "varchar",
      name: "first_name",
      nullable: true,
    },
    lastName: {
      type: "varchar",
      name: "last_name",
      nullable: true,
    },
    phoneNumber: {
      type: "varchar",
      name: "phone_number",
      nullable: true,
    },
    role: {
      type: "varchar",
      nullable: false,
      default: "user",
    },
    status: {
      type: "varchar",
      nullable: false,
      default: "active",
    },
    createdAt: {
      type: "timestamp",
      name: "created_at",
      default: () => "CURRENT_TIMESTAMP",
    },
    updatedAt: {
      type: "timestamp",
      name: "updated_at",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    carts: {
      type: "one-to-many",
      target: "Cart",
      inverseSide: "user",
    },
    orders: {
      type: "one-to-many",
      target: "Order",
      inverseSide: "user",
    },
    reviews: {
      type: "one-to-many",
      target: "Review",
      inverseSide: "user",
    },
    seller: {
      type: "one-to-many",
      target: "Seller",
      inverseSide: "user",
    },
  },
});

module.exports = User;
