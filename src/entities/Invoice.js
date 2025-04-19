const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Invoice",
  tableName: "invoices",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    cartId: {
      type: "bigint",
      nullable: false,
    },
    userId: {
      type: "bigint",
      nullable: false,
    },
    sellerId: {
      type: "bigint",
      nullable: false,
    },
    amount: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
    },
    status: {
      type: "enum",
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    paymentMethod: {
      type: "varchar",
      nullable: false,
    },
    paymentDate: {
      type: "timestamp",
      nullable: true,
    },
    createdAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    updatedAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    cart: {
      type: "many-to-one",
      target: "Cart",
      joinColumn: {
        name: "cartId",
        referencedColumnName: "id",
      },
    },
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "userId",
        referencedColumnName: "id",
      },
    },
    seller: {
      type: "many-to-one",
      target: "Seller",
      joinColumn: {
        name: "sellerId",
        referencedColumnName: "id",
      },
    },
  },
});
