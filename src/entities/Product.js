const { EntitySchema } = require("typeorm");

const Product = new EntitySchema({
  name: "Product",
  tableName: "Product",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    productName: {
      type: "varchar",
      name: "product_name",
      nullable: false,
    },
    productImage: {
      type: "varchar",
      name: "product_image",
      nullable: false,
    },
    productStatus: {
      type: "varchar",
      name: "product_status",
      nullable: false,
    },
    standardPrice: {
      type: "decimal",
      name: "standard_price",
      precision: 8,
      scale: 2,
      nullable: false,
    },
    offerPrice: {
      type: "decimal",
      name: "offer_price",
      precision: 8,
      scale: 2,
      nullable: false,
    },
    productDescription: {
      type: "text",
      name: "product_description",
      nullable: false,
    },
    productDate: {
      type: "date",
      name: "product_date",
      nullable: false,
    },
    productQuantity: {
      type: "decimal",
      name: "product_quantity",
      precision: 8,
      scale: 2,
      nullable: false,
    },
    storeId: {
      type: "bigint",
      name: "store_id",
      nullable: false,
    },
  },
  relations: {
    categories: {
      type: "many-to-many",
      target: "Category",
      joinTable: {
        name: "product_categories",
        joinColumn: {
          name: "product_id",
          referencedColumnName: "id",
        },
        inverseJoinColumn: {
          name: "category_id",
          referencedColumnName: "id",
        },
      },
    },
  },
});

module.exports = Product;
