const { EntitySchema } = require("typeorm");

const Order = new EntitySchema({
  name: "Order",
  tableName: "orders",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    orderNumber: {
      type: "varchar",
      name: "order_number",
      nullable: false,
      unique: true,
    },
    orderStatus: {
      type: "varchar",
      name: "order_status",
      nullable: false,
    },
    orderDate: {
      type: "date",
      name: "order_date",
      nullable: false,
    },
    cartId: {
      type: "bigint",
      name: "cart_id",
      nullable: false,
    },
    paymentInfo: {
      type: "varchar",
      name: "payment_info",
      nullable: false,
    },
    country: {
      type: "varchar",
      nullable: false,
    },
    city: {
      type: "varchar",
      nullable: false,
    },
    streetAddress: {
      type: "varchar",
      name: "street_address",
      nullable: false,
    },
    userId: {
      type: "bigint",
      name: "user_id",
      nullable: false,
    },
    phoneNumber: {
      type: "varchar",
      name: "phone_number",
      nullable: false,
    },
    email: {
      type: "varchar",
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
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "user_id",
        referencedColumnName: "id",
      },
    },
    cart: {
      type: "many-to-one",
      target: "Cart",
      joinColumn: {
        name: "cart_id",
        referencedColumnName: "id",
      },
    },
  },
});

module.exports = Order;
