const { EntitySchema } = require("typeorm");

const Cart = new EntitySchema({
  name: "Cart",
  tableName: "carts",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    userId: {
      type: "bigint",
      name: "user_id",
      nullable: false,
    },
    totalPrice: {
      type: "decimal",
      name: "total_price",
      precision: 10,
      scale: 2,
      nullable: false,
      default: 0,
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
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "user_id",
        referencedColumnName: "id",
      },
    },
    cartItems: {
      type: "one-to-many",
      target: "CartItem",
      inverseSide: "cart",
    },
    order: {
      type: "one-to-one",
      target: "Order",
      inverseSide: "cart",
    },
  },
});

module.exports = Cart;
