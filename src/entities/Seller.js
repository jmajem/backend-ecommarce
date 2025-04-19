const { EntitySchema } = require("typeorm");

const Seller = new EntitySchema({
  name: "Seller",
  tableName: "seller",
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
    storeId: {
      type: "bigint",
      name: "store_id",
      nullable: false,
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
    store: {
      type: "many-to-one",
      target: "Store",
      joinColumn: {
        name: "store_id",
        referencedColumnName: "id",
      },
    },
  },
});

module.exports = Seller;
