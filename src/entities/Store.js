const { EntitySchema } = require("typeorm");

const Store = new EntitySchema({
  name: "Store",
  tableName: "stores",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
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
    products: {
      type: "one-to-many",
      target: "Product",
      inverseSide: "store",
    },
    sellers: {
      type: "one-to-many",
      target: "Seller",
      inverseSide: "store",
    },
  },
});

module.exports = Store;
