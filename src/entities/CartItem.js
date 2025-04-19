const { EntitySchema } = require("typeorm");

const CartItem = new EntitySchema({
  name: "CartItem",
  tableName: "cart_items",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    cartId: {
      type: "bigint",
      name: "cart_id",
      nullable: false,
    },
    productId: {
      type: "bigint",
      name: "product_id",
      nullable: false,
    },
    quantity: {
      type: "int",
      nullable: false,
      default: 1,
    },
    price: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
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
    cart: {
      type: "many-to-one",
      target: "Cart",
      joinColumn: {
        name: "cart_id",
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
  },
});

module.exports = CartItem;
