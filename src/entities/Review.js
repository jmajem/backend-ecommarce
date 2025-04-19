const { EntitySchema } = require("typeorm");

const Review = new EntitySchema({
  name: "Review",
  tableName: "reviews",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    rating: {
      type: "int",
      nullable: false,
    },
    comment: {
      type: "text",
      nullable: true,
    },
    userId: {
      type: "bigint",
      name: "user_id",
      nullable: false,
    },
    productId: {
      type: "bigint",
      name: "product_id",
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
    product: {
      type: "many-to-one",
      target: "Product",
      joinColumn: {
        name: "product_id",
        referencedColumnName: "id",
      },
    },
    replies: {
      type: "one-to-many",
      target: "ReviewReply",
      inverseSide: "review",
    },
  },
});

module.exports = Review;
