const { EntitySchema } = require("typeorm");

const Category = new EntitySchema({
  name: "Category",
  tableName: "Category",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    categoryName: {
      type: "varchar",
      name: "category_name",
      nullable: false,
    },
    categoryImage: {
      type: "jsonb",
      name: "category_image",
      nullable: false,
    },
    categoryTopic: {
      type: "varchar",
      name: "category_topic",
      nullable: true,
    },
    status: {
      type: "varchar",
      nullable: false,
    },
    createdAt: {
      type: "date",
      name: "created_at",
      nullable: false,
    },
    time: {
      type: "time",
      nullable: false,
    },
  },
  relations: {
    products: {
      type: "many-to-many",
      target: "Product",
      joinTable: {
        name: "product_categories",
        joinColumn: {
          name: "category_id",
          referencedColumnName: "id",
        },
        inverseJoinColumn: {
          name: "product_id",
          referencedColumnName: "id",
        },
      },
    },
  },
});

module.exports = Category;
