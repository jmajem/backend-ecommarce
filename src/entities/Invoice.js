const { EntitySchema } = require("typeorm");

const Invoice = new EntitySchema({
  name: "Invoice",
  tableName: "invoices",
  columns: {
    id: {
      primary: true,
      type: "bigint",
      generated: true,
    },
    invoiceSales: {
      type: "varchar",
      name: "invoice_sales",
      nullable: false,
    },
    invoiceDate: {
      type: "varchar",
      name: "invoice_date",
      nullable: false,
    },
    invoiceTotalPrice: {
      type: "decimal",
      name: "invoice_total_price",
      precision: 8,
      scale: 2,
      nullable: false,
    },
    invoiceOrderNumber: {
      type: "varchar",
      name: "invoice_order_number",
      nullable: false,
      unique: true,
    },
    invoicePaymentType: {
      type: "varchar",
      name: "invoice_payment_type",
      nullable: false,
    },
    invoicePaymentStatus: {
      type: "varchar",
      name: "invoice_payment_status",
      nullable: false,
    },
    sellerId: {
      type: "bigint",
      name: "seller_id",
      nullable: false,
    },
    userId: {
      type: "bigint",
      name: "user_id",
      nullable: false,
    },
    orderId: {
      type: "bigint",
      name: "order_id",
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
    seller: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "seller_id",
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
    order: {
      type: "many-to-one",
      target: "Order",
      joinColumn: {
        name: "order_id",
        referencedColumnName: "id",
      },
    },
  },
});

module.exports = Invoice;
