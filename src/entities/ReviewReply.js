const { EntitySchema } = require("typeorm");

const ReviewReply = new EntitySchema({
  name: "ReviewReply",
  tableName: "review_replies",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    content: {
      type: "text",
      nullable: false,
    },
    reviewId: {
      type: "bigint",
      name: "review_id",
      nullable: false,
    },
    userId: {
      type: "bigint",
      name: "user_id",
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
    review: {
      type: "many-to-one",
      target: "Review",
      joinColumn: {
        name: "review_id",
        referencedColumnName: "id",
      },
    },
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "user_id",
        referencedColumnName: "id",
      },
    },
  },
});

module.exports = ReviewReply;
